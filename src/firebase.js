// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseMissingKeys = Object.entries(cfg)
  .filter(([, v]) => !v)
  .map(([k]) => k);

export const firebaseReady = firebaseMissingKeys.length === 0;

export const firebaseError = firebaseReady
  ? null
  : new Error(
      `Firebase env vars missing: ${firebaseMissingKeys.join(", ")}. Check .env (must start with VITE_).`
    );

let firestorePersistencePromise = null;

function startFirestorePersistence(db) {
  if (!db || typeof window === "undefined") {
    return Promise.resolve({ enabled: false, reason: "unavailable" });
  }

  if (!firestorePersistencePromise) {
    firestorePersistencePromise = enableIndexedDbPersistence(db)
      .then(() => ({ enabled: true, reason: null }))
      .catch((error) => {
        const code = String(error?.code || "unknown");

        if (code === "failed-precondition") {
          console.warn(
            "[Doggerz] Firestore persistence unavailable because another tab already owns it."
          );
        } else if (code === "unimplemented") {
          console.warn(
            "[Doggerz] Firestore persistence is not supported in this environment."
          );
        } else {
          console.warn(
            "[Doggerz] Firestore persistence failed to start:",
            error
          );
        }

        return { enabled: false, reason: code, error };
      });
  }

  return firestorePersistencePromise;
}

export function initFirebase() {
  if (!firebaseReady) return { app: null, auth: null, db: null };
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  const db = getFirestore(app);
  void startFirestorePersistence(db);
  return { app, auth: getAuth(app), db };
}

export function ensureFirebasePersistence() {
  if (!firebaseReady) {
    return Promise.resolve({ enabled: false, reason: "firebase_not_ready" });
  }

  const { db } = initFirebase();
  return startFirestorePersistence(db);
}

export function assertFirebaseReady() {
  if (!firebaseReady) throw firebaseError;
}

const initialized = initFirebase();
export const app = initialized.app;
export const auth = initialized.auth;
export const db = initialized.db;
export const firebasePersistenceReady = ensureFirebasePersistence();
