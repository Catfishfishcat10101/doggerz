// src/lib/persistence.js
// Local-first saves; Firebase optional (lazy import). Zero build-time coupling.

const STORAGE_KEY = "doggerz:save:v1";
const localKey = (uid) => (uid ? `${STORAGE_KEY}:${uid}` : STORAGE_KEY);

// ---- Optional Firebase (lazy) ----------------------------------------------
let cached = { tried: false, auth: null, db: null };
async function getFirebase() {
  if (cached.tried) return cached;
  cached.tried = true;
  try {
    const mod = await import("@/lib/firebase"); // resolves only if your module exists
    cached.auth = mod?.auth ?? null;
    cached.db   = mod?.db ?? null;
  } catch {
    // stay local-only
  }
  return cached;
}

// ---- Local storage primitives ----------------------------------------------
function readLocal(uid) {
  try {
    const raw = localStorage.getItem(localKey(uid));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocal(uid, data) {
  try {
    localStorage.setItem(localKey(uid), JSON.stringify(data));
  } catch {
    // quota exceeded or blocked; ignore
  }
}

// ---- Public API -------------------------------------------------------------
/** Load game state. Priority: cloud (if authed) → local → null */
export async function loadGame() {
  const { auth, db } = await getFirebase();
  const uid = auth?.currentUser?.uid ?? null;

  if (uid && db) {
    try {
      const { doc, getDoc } = await import("firebase/firestore");
      const snap = await getDoc(doc(db, "saves", uid));
      if (snap.exists()) {
        const cloud = snap.data();
        writeLocal(uid, cloud); // mirror for offline
        return cloud;
      }
    } catch {
      // ignore and fallback to local
    }
  }

  return readLocal(uid);
}

/** Save game state. Always writes local; writes cloud if authed + Firestore present. */
export async function saveGame(state) {
  const when = Date.now();
  const payload = { ...state, _meta: { updatedAt: when } };

  const { auth, db } = await getFirebase();
  const uid = auth?.currentUser?.uid ?? null;

  // Local copy first
  writeLocal(uid, payload);

  // Optional cloud copy
  if (uid && db) {
    try {
      const { doc, setDoc } = await import("firebase/firestore");
      await setDoc(doc(db, "saves", uid), payload, { merge: true });
    } catch {
      // cloud failed; local still good
    }
  }

  return payload;
}

/** Alias used by some hooks: take a snapshot of current dog state. */
export const saveSnapshot = saveGame;

/** Merge helper: shallow-merge patch into current save and persist. */
export async function mergeGame(patch) {
  const current = (await loadGame()) || {};
  const next = { ...current, ...patch };
  return saveGame(next);
}

/** Debounced saver to throttle frequent writes (e.g., during ticks). */
export function createDebouncedSaver(delayMs = 600) {
  let t = null;
  return (stateProducer) =>
    new Promise((resolve) => {
      if (t) clearTimeout(t);
      t = setTimeout(async () => {
        const state =
          typeof stateProducer === "function" ? stateProducer() : stateProducer;
        const saved = await saveGame(state);
        resolve(saved);
      }, delayMs);
    });
}
