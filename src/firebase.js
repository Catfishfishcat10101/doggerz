// src/firebase.js
// Firebase v9+ modular, hardened for Vite + React + PWAs

import { initializeApp, getApps } from "firebase/app";
import {
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  inMemoryPersistence,
  GoogleAuthProvider,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
  doc,
  collection,
} from "firebase/firestore";

/* ----------------------------- Env helpers ------------------------------ */

function requireEnv(key) {
  const v = import.meta.env[key];
  if (v === undefined || v === "") {
    // Fail fast during local dev; keeps you from chasing null configs
    throw new Error(`Missing required env: ${key}`);
  }
  return v;
}

const firebaseConfig = {
  apiKey:            requireEnv("VITE_FB_API_KEY"),
  authDomain:        requireEnv("VITE_FB_AUTH_DOMAIN"),
  projectId:         requireEnv("VITE_FB_PROJECT_ID"),
  storageBucket:     requireEnv("VITE_FB_STORAGE_BUCKET"),
  messagingSenderId: requireEnv("VITE_FB_MESSAGING_SENDER_ID"),
  appId:             requireEnv("VITE_FB_APP_ID"),
};

/* ----------------------------- App singletons --------------------------- */

// Avoid double-init across HMR reloads
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

/**
 * Auth:
 * - initializeAuth lets us define persistence before first use.
 * - Persistence order: IndexedDB (best), then LocalStorage, then in-memory.
 * - In-memory ensures auth APIs don’t throw in weird sandbox contexts.
 */
export const auth = initializeAuth(app, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence, inMemoryPersistence],
});

export const googleProvider = new GoogleAuthProvider();
// Force account chooser, avoids auto-selecting a cached Google session
googleProvider.setCustomParameters({ prompt: "select_account" });

/**
 * Firestore:
 * - Standard instance + convenience ref helpers
 */
export const db = getFirestore(app);

// Convenience helpers for common doc/collection refs (optional but handy)
export const refs = {
  userDoc: (uid) => doc(db, "users", uid),
  dogDoc:  (uid) => doc(db, "users", uid, "doggerz", "dog"),   // one-dog-per-user
  shop:    () => collection(db, "shop"),
  stats:   (uid) => doc(db, "users", uid, "meta", "stats"),
};

/* ----------------------------- Emulators (dev) -------------------------- */
/**
 * Flip the emulators on with VITE_USE_EMULATORS=true in your .env.development
 * Default ports:
 *  - Auth:      9099
 *  - Firestore: 8080
 */
const useEmu = import.meta.env.DEV && String(import.meta.env.VITE_USE_EMULATORS).toLowerCase() === "true";

if (useEmu) {
  // Avoid reconnecting across HMR
  // Auth emulator must be http:// (not https) and include port
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  } catch (_) {/* noop */}
  try {
    connectFirestoreEmulator(db, "localhost", 8080);
  } catch (_) {/* noop */}
}

/* ----------------------------- Optional niceties ------------------------ */
// Example: set auth language (affects OAuth popups)
try {
  auth.languageCode = navigator?.language || "en";
} catch (_) {/* noop */}

// Export the app too, if you need Storage/Functions elsewhere
export { app };
