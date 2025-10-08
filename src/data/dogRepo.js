// src/data/dogRepo.js
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  onSnapshot,
  increment,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * @typedef {Object} DogStats
 * @property {number} hunger       0..100
 * @property {number} energy       0..100
 * @property {number} cleanliness  0..100
 *
 * @typedef {Object} DogDoc
 * @property {string} id
 * @property {string|null} ownerId
 * @property {string|null} name
 * @property {"idle"|"happy"|"grumpy"|"sleeping"} mood
 * @property {any} createdAt     // Firestore Timestamp
 * @property {any} updatedAt     // Firestore Timestamp
 * @property {DogStats} stats
 * @property {number} schemaVersion
 */

// -----------------------------
// utilities
// -----------------------------
const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
const hasNum = (v) => typeof v === "number" && Number.isFinite(v);

// -----------------------------
// shaping + converter
// -----------------------------
/** Normalize a dog document coming from Firestore. */
function shapeDog(id, data) {
  const stats = data?.stats ?? {};
  return /** @type {DogDoc} */ ({
    id,
    ownerId: data?.ownerId ?? null,
    name: data?.name ?? null,
    mood: data?.mood ?? "idle",
    createdAt: data?.createdAt ?? null,
    updatedAt: data?.updatedAt ?? null,
    schemaVersion: Number(data?.schemaVersion ?? 1),
    stats: {
      hunger: clamp(Number(stats.hunger ?? 100), 0, 100),
      energy: clamp(Number(stats.energy ?? 100), 0, 100),
      cleanliness: clamp(Number(stats.cleanliness ?? 100), 0, 100),
    },
  });
}

/** Firestore data <-> app shape (keeps writes/reads consistent). */
const dogConverter = {
  toFirestore(/** @type {Omit<DogDoc,"id">} */ dog) {
    return {
      ownerId: dog.ownerId ?? null,
      name: dog.name ?? null,
      mood: dog.mood ?? "idle",
      createdAt: dog.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
      schemaVersion: Number(dog.schemaVersion ?? 1),
      stats: {
        hunger: clamp(Number(dog.stats?.hunger ?? 100), 0, 100),
        energy: clamp(Number(dog.stats?.energy ?? 100), 0, 100),
        cleanliness: clamp(Number(dog.stats?.cleanliness ?? 100), 0, 100),
      },
    };
  },
  fromFirestore(snap, options) {
    // IMPORTANT: use serverTimestamps:'estimate' so we don't get nulls post-write
    const data = snap.data({ serverTimestamps: "estimate", ...options });
    return shapeDog(snap.id, data ?? {});
  },
};

// Helper: typed doc ref
const dogRef = (uid) => doc(db, "dogs", uid).withConverter(dogConverter);

// -----------------------------
// repo API
// -----------------------------

/**
 * Idempotently ensure a dog doc for the given uid.
 * Uses a transaction to avoid duplicate creation under race.
 * Also performs a light migration if a legacy doc exists.
 * @param {string} uid
 * @returns {Promise<DogDoc>}
 */
export async function ensureDogForUser(uid) {
  if (!uid) throw new Error("ensureDogForUser: uid required");
  const ref = dogRef(uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      /** @type {Omit<DogDoc,"id">} */
      const dog = {
        ownerId: uid,
        name: null,
        mood: "idle",
        stats: { hunger: 100, energy: 100, cleanliness: 100 },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        schemaVersion: 1,
      };
      tx.set(ref, dog, { merge: false });
      return;
    }

    // Lightweight migration: ensure required fields exist
    const docData = snap.data(); // via converter → already shaped
    /** @type {Partial<DogDoc>} */
    const patch = {};
    if (docData.schemaVersion == null) patch.schemaVersion = 1;
    if (!docData.stats) patch.stats = { hunger: 100, energy: 100, cleanliness: 100 };
    if (Object.keys(patch).length) {
      tx.update(ref, { ...patch, updatedAt: serverTimestamp() });
    }
  });

  const snap = await getDoc(ref);
  return snap.data(); // via converter → DogDoc
}

/**
 * Read once (non-realtime).
 * @param {string} uid
 * @returns {Promise<DogDoc|null>}
 */
export async function getDog(uid) {
  if (!uid) throw new Error("getDog: uid required");
  const snap = await getDoc(dogRef(uid));
  return snap.exists() ? snap.data() : null;
}

/**
 * Validate and set the dog name (max 24 chars, letters/numbers/basic punctuation).
 * Returns the committed name.
 * @param {string} uid
 * @param {string} name
 */
export async function nameDog(uid, name) {
  if (!uid) throw new Error("nameDog: uid required");
  const trimmed = String(name ?? "").trim().slice(0, 24);
  if (!trimmed) throw new Error("Name required");
  if (!/^[\p{L}\p{N} .,'-]{1,24}$/u.test(trimmed)) {
    throw new Error("Invalid name format");
  }
  const ref = dogRef(uid);
  await updateDoc(ref, { name: trimmed, updatedAt: serverTimestamp() });
  return trimmed;
}

/**
 * Subscribe to the dog document in real time.
 * Uses { serverTimestamps: 'estimate' } to avoid nulls on fresh writes.
 * @param {string} uid
 * @param {(d: DogDoc)=>void} cb
 * @param {(err: any)=>void} [errCb]
 * @returns {() => void} unsubscribe
 */
export function watchDog(uid, cb, errCb) {
  if (!uid) throw new Error("watchDog: uid required");
  const ref = dogRef(uid);
  return onSnapshot(
    ref,
    { includeMetadataChanges: false },
    (snap) => {
      // via converter, but we still pass options to be explicit:
      const data = snap.data({ serverTimestamps: "estimate" });
      cb(data);
    },
    errCb
  );
}

/**
 * Incrementally update stats with clamping (atomic).
 * deltas: { hunger?: ±number, energy?: ±number, cleanliness?: ±number }
 * @param {string} uid
 * @param {{hunger?: number, energy?: number, cleanliness?: number}} deltas
 */
export async function updateDogStats(uid, deltas) {
  if (!uid) throw new Error("updateDogStats: uid required");
  const ref = dogRef(uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Dog not found");
    const current = snap.data(); // shaped

    const next = {
      hunger: hasNum(deltas?.hunger)
        ? clamp(current.stats.hunger + Number(deltas.hunger), 0, 100)
        : current.stats.hunger,
      energy: hasNum(deltas?.energy)
        ? clamp(current.stats.energy + Number(deltas.energy), 0, 100)
        : current.stats.energy,
      cleanliness: hasNum(deltas?.cleanliness)
        ? clamp(current.stats.cleanliness + Number(deltas.cleanliness), 0, 100)
        : current.stats.cleanliness,
    };

    tx.update(ref, {
      "stats.hunger": next.hunger,
      "stats.energy": next.energy,
      "stats.cleanliness": next.cleanliness,
      updatedAt: serverTimestamp(),
    });
  });
}

/**
 * Fast-path atomic increments (if you know you won’t exceed [0,100] mid-flight).
 * Useful for small adjustments inside the range; clamp visually on read.
 * NOTE: To be safer, we calculate a pre-check if current value is near edges.
 * If risky, we fall back to a transaction.
 * @param {string} uid
 * @param {{hunger?: number, energy?: number, cleanliness?: number}} deltas
 */
export async function bumpDogStats(uid, deltas) {
  if (!uid) throw new Error("bumpDogStats: uid required");
  const ref = dogRef(uid);

  // quick guard: if any delta could push us out-of-bounds with a small margin, use transaction
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Dog not found");
  const cur = snap.data();

  const risky =
    (hasNum(deltas?.hunger) && (cur.stats.hunger + deltas.hunger < 0 || cur.stats.hunger + deltas.hunger > 100)) ||
    (hasNum(deltas?.energy) && (cur.stats.energy + deltas.energy < 0 || cur.stats.energy + deltas.energy > 100)) ||
    (hasNum(deltas?.cleanliness) &&
      (cur.stats.cleanliness + deltas.cleanliness < 0 || cur.stats.cleanliness + deltas.cleanliness > 100));

  if (risky) {
    // fall back to clamped transactional path
    return updateDogStats(uid, deltas);
  }

  const payload = { updatedAt: serverTimestamp() };
  if (hasNum(deltas?.hunger)) payload["stats.hunger"] = increment(Number(deltas.hunger));
  if (hasNum(deltas?.energy)) payload["stats.energy"] = increment(Number(deltas.energy));
  if (hasNum(deltas?.cleanliness)) payload["stats.cleanliness"] = increment(Number(deltas.cleanliness));
  await updateDoc(ref, payload);
}

/**
 * Reset dog (same doc id/ownerId; clears name and stats).
 * @param {string} uid
 */
export async function resetDog(uid) {
  if (!uid) throw new Error("resetDog: uid required");
  const ref = dogRef(uid);
  await updateDoc(ref, {
    name: null,
    "stats.hunger": 100,
    "stats.energy": 100,
    "stats.cleanliness": 100,
    mood: "idle",
    updatedAt: serverTimestamp(),
  });
}
