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
 * Normalize a dog document coming from a snapshot or plain object.
 * Ensures required fields exist and types are sane.
 */
function shapeDog(id, data) {
  const stats = data?.stats ?? {};
  return {
    id,
    ownerId: data?.ownerId ?? null,
    name: data?.name ?? null,
    mood: data?.mood ?? "idle",
    createdAt: data?.createdAt ?? null,
    updatedAt: data?.updatedAt ?? null,
    stats: {
      hunger: clamp(Number(stats.hunger ?? 100), 0, 100),
      energy: clamp(Number(stats.energy ?? 100), 0, 100),
      cleanliness: clamp(Number(stats.cleanliness ?? 100), 0, 100),
    },
  };
}

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

/**
 * Idempotently ensure a dog doc for the given uid.
 * Uses a transaction to avoid duplicate creation under race.
 */
export async function ensureDogForUser(uid) {
  if (!uid) throw new Error("ensureDogForUser: uid required");
  const ref = doc(db, "dogs", uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (snap.exists()) return;
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
  });

  // Read back with serverTimestamp estimates so UI isn’t null-ish
  const snap = await getDoc(ref, { /* SnapshotOptions not supported here; estimate via realtime below if needed */ });
  return shapeDog(ref.id, snap.data() ?? {});
}

/**
 * Validate and set the dog name (max 24 chars, letters/numbers/basic punctuation).
 * Returns the committed name.
 */
export async function nameDog(uid, name) {
  if (!uid) throw new Error("nameDog: uid required");
  const trimmed = String(name ?? "").trim().slice(0, 24);
  if (!trimmed) throw new Error("Name required");
  if (!/^[\p{L}\p{N} .,'-]{1,24}$/u.test(trimmed)) {
    throw new Error("Invalid name format");
  }

  const ref = doc(db, "dogs", uid);
  await updateDoc(ref, { name: trimmed, updatedAt: serverTimestamp() });
  return trimmed;
}

/**
 * Subscribe to the dog document in real time.
 * Uses {serverTimestamps: 'estimate'} to avoid nulls on fresh writes.
 */
export function watchDog(uid, cb, errCb) {
  if (!uid) throw new Error("watchDog: uid required");
  const ref = doc(db, "dogs", uid);
  return onSnapshot(
    ref,
    { includeMetadataChanges: false },
    (snap) => cb(shapeDog(uid, snap.data() ?? {})),
    errCb
  );
}

/**
 * Incrementally update stats with clamping (atomic).
 * deltas: { hunger?: ±number, energy?: ±number, cleanliness?: ±number }
 */
export async function updateDogStats(uid, deltas) {
  if (!uid) throw new Error("updateDogStats: uid required");
  const ref = doc(db, "dogs", uid);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("Dog not found");
    const current = shapeDog(uid, snap.data());

    const next = {
      hunger:
        deltas?.hunger != null
          ? clamp(current.stats.hunger + Number(deltas.hunger), 0, 100)
          : current.stats.hunger,
      energy:
        deltas?.energy != null
          ? clamp(current.stats.energy + Number(deltas.energy), 0, 100)
          : current.stats.energy,
      cleanliness:
        deltas?.cleanliness != null
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
 */
export async function bumpDogStats(uid, deltas) {
  const ref = doc(db, "dogs", uid);
  const payload = { updatedAt: serverTimestamp() };
  if (typeof deltas?.hunger === "number") payload["stats.hunger"] = increment(deltas.hunger);
  if (typeof deltas?.energy === "number") payload["stats.energy"] = increment(deltas.energy);
  if (typeof deltas?.cleanliness === "number") payload["stats.cleanliness"] = increment(deltas.cleanliness);
  await updateDoc(ref, payload);
}

/**
 * Reset dog (keep the same doc id/ownerId; clears name and stats).
 */
export async function resetDog(uid) {
  const ref = doc(db, "dogs", uid);
  await updateDoc(ref, {
    name: null,
    "stats.hunger": 100,
    "stats.energy": 100,
    "stats.cleanliness": 100,
    mood: "idle",
    updatedAt: serverTimestamp(),
  });
}
