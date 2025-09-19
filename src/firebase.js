// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";

// --- Guard: ensure required env vars exist (nice errors in dev)
const req = (k) => {
  const v = import.meta.env[k];
  if (!v) {
    // throw in dev to surface misconfig quickly; in prod you might log instead
    throw new Error(`Missing required env: ${k}`);
  }
  return v;
};

const firebaseConfig = {
  apiKey: req("VITE_FB_API_KEY"),
  authDomain: req("VITE_FB_AUTH_DOMAIN"),
  projectId: req("VITE_FB_PROJECT_ID"),
  storageBucket: req("VITE_FB_STORAGE_BUCKET"),
  messagingSenderId: req("VITE_FB_MESSAGING_SENDER_ID"),
  appId: req("VITE_FB_APP_ID"),
};

// Avoid duplicate init during HMR
const app = getApps()[0] ?? initializeApp(firebaseConfig);

// Auth with persistent session (good for PWAs/offline)
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(() => {
  // non-fatal: some browsers (private mode) may downgrade persistence
});

// Google provider (prompt account each time in dev to avoid sticky sessions)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Firestore
export const db = getFirestore(app);

// --- Optional: local emulators (toggle with VITE_USE_FIREBASE_EMULATOR=1)
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "1") {
  try {
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
    // console.info("[Firebase] Using local emulators");
  } catch {
    // ignore if already connected during HMR
  }
}
