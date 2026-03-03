// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (import.meta.env.DEV) {
  console.log("Firebase project:", import.meta.env.VITE_FIREBASE_PROJECT_ID);
  console.log(
    "Firebase apiKey starts:",
    String(import.meta.env.VITE_FIREBASE_API_KEY).slice(0, 8)
  );
}

export const firebaseMissingKeys = Object.entries(cfg)
  .filter(([, v]) => !v)
  .map(([k]) => k);

export const firebaseReady = firebaseMissingKeys.length === 0;

export const firebaseError = firebaseReady
  ? null
  : new Error(
      `Firebase env vars missing: ${firebaseMissingKeys.join(", ")}. Check .env (must start with VITE_).`
    );

export function initFirebase() {
  if (!firebaseReady) return { app: null, auth: null, db: null };
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  return { app, auth: getAuth(app), db: getFirestore(app) };
}

export function assertFirebaseReady() {
  if (!firebaseReady) throw firebaseError;
}

const initialized = initFirebase();
export const app = initialized.app;
export const auth = initialized.auth;
export const db = initialized.db;
