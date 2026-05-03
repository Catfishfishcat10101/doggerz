// src/lib/firebase/index.js
// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredCfg = {
  apiKey: cfg.apiKey,
  authDomain: cfg.authDomain,
  projectId: cfg.projectId,
  storageBucket: cfg.storageBucket,
  messagingSenderId: cfg.messagingSenderId,
  appId: cfg.appId,
};

export const firebaseMissingKeys = Object.entries(requiredCfg)
  .filter(([, v]) => !v)
  .map(([k]) => k);

export const firebaseReady = firebaseMissingKeys.length === 0;

export const firebaseError = firebaseReady
  ? null
  : new Error(
      `Firebase env vars missing: ${firebaseMissingKeys.join(", ")}. Check .env (must start with VITE_).`
    );

let firestoreInstance = null;
let firestorePersistencePromise = null;

function initFirestoreDb(app) {
  if (firestoreInstance) return firestoreInstance;

  if (typeof window === "undefined") {
    firestoreInstance = getFirestore(app);
    firestorePersistencePromise = Promise.resolve({
      enabled: false,
      reason: "unavailable",
    });
    return firestoreInstance;
  }

  try {
    firestoreInstance = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });
    firestorePersistencePromise = Promise.resolve({
      enabled: true,
      reason: null,
    });
  } catch (error) {
    console.warn(
      "[Doggerz] Firestore persistent cache failed to initialize; falling back to default cache.",
      error
    );
    firestoreInstance = getFirestore(app);
    firestorePersistencePromise = Promise.resolve({
      enabled: false,
      reason: "fallback",
      error,
    });
  }

  return firestoreInstance;
}

export function initFirebase() {
  if (!firebaseReady) return { app: null, auth: null, db: null };
  const app = getApps().length ? getApps()[0] : initializeApp(cfg);
  const db = initFirestoreDb(app);
  return { app, auth: getAuth(app), db };
}

export function ensureFirebasePersistence() {
  if (!firebaseReady) {
    return Promise.resolve({ enabled: false, reason: "firebase_not_ready" });
  }

  const { db } = initFirebase();
  return (
    firestorePersistencePromise || Promise.resolve({ enabled: Boolean(db) })
  );
}

export function assertFirebaseReady() {
  if (!firebaseReady) throw firebaseError;
}

const initialized = initFirebase();
export const app = initialized.app;
export const auth = initialized.auth;
export const db = initialized.db;
export const firebasePersistenceReady = ensureFirebasePersistence();
