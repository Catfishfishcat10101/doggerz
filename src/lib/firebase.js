// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import {
  getFirestore,
  enableIndexedDbPersistence,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ----- Config via Vite env (defined in .env/.env.local) ----------------------
const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  // IMPORTANT: this must be the literal bucket name, typically "<project>.appspot.com"
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
};

// ----- App (re-use across HMR) ----------------------------------------------
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ----- Auth ------------------------------------------------------------------
const auth = getAuth(app);
// Durable sessions across reloads (don’t await: non-blocking for UX)
setPersistence(auth, browserLocalPersistence).catch(() => {});

// ----- Firestore -------------------------------------------------------------
const db = getFirestore(app);

// Offline cache: prefer IndexedDB; gracefully fall back if multi-tab conflict
enableIndexedDbPersistence(db).catch((err) => {
  // 'failed-precondition' => multiple tabs; 'unimplemented' => browser lacks IndexedDB
  if (import.meta.env.DEV) {
    console.warn("[Firestore] persistence disabled:", err?.code || err);
  }
});

// ----- Storage ---------------------------------------------------------------
const storage = getStorage(app);

// ----- Optional: Local Emulators in dev -------------------------------------
// Toggle with VITE_USE_EMULATORS=1 in your .env.local for local development.
// Ports must match firebase.json -> "emulators".
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === "1") {
  (async () => {
    try {
      const { connectAuthEmulator } = await import("firebase/auth");
      const { connectFirestoreEmulator } = await import("firebase/firestore");
      const { connectStorageEmulator } = await import("firebase/storage");

      connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
      connectFirestoreEmulator(db, "127.0.0.1", 8080);
      connectStorageEmulator(storage, "127.0.0.1", 9199);

      // eslint-disable-next-line no-console
      console.info("[Firebase] Connected to local emulators.");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("[Firebase] Emulator wiring failed:", e);
    }
  })();
}

// ----- Exports ---------------------------------------------------------------
export { app, auth, db, storage };
export default { app, auth, db, storage };
