// src/lib/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  connectAuthEmulator,
} from "firebase/auth";
import {
  getFirestore,
  connectFirestoreEmulator,
} from "firebase/firestore";

// Read from .env.local (Vite exposes VITE_* to the client)
const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize exactly once (prevents re-declare errors in HMR)
const app = getApps().length ? getApp() : initializeApp(cfg);

// Single declarations
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Optional: local emulators if you set VITE_USE_FIREBASE_EMULATOR=1
if (String(import.meta.env.VITE_USE_FIREBASE_EMULATOR || "") === "1") {
  try { connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true }); } catch {}
  try { connectFirestoreEmulator(db, "127.0.0.1", 8080); } catch {}
  console.info("[Doggerz] Using Firebase Emulators");
}

export { app, auth, db, googleProvider };
export default app;
