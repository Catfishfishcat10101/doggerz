import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function getFirebaseConfig() {
  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
  };
}

function hasFirebaseConfig(config = getFirebaseConfig()) {
  return Boolean(config.apiKey && config.projectId && config.appId);
}

let firebaseApp = null;
let firebaseAuth = null;
let firebaseDb = null;
let firebaseInitialized = false;

export function initFirebase() {
  if (firebaseInitialized) {
    return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
  }

  firebaseInitialized = true;
  const config = getFirebaseConfig();
  if (!hasFirebaseConfig(config)) {
    return { app: null, auth: null, db: null };
  }

  firebaseApp = getApps().length ? getApp() : initializeApp(config);
  firebaseAuth = getAuth(firebaseApp);
  firebaseDb = getFirestore(firebaseApp);
  return { app: firebaseApp, auth: firebaseAuth, db: firebaseDb };
}

const services = initFirebase();

export const app = services.app;
export const auth = services.auth;
export const db = services.db;
export const firebaseReady = Boolean(app && auth && db);

export async function ensureFirebasePersistence() {
  if (!firebaseReady || !auth) return false;
  try {
    await setPersistence(auth, browserLocalPersistence);
    return true;
  } catch {
    return false;
  }
}

export function assertFirebaseReady(label = "Firebase") {
  if (!firebaseReady) {
    throw new Error(`${label} requires Firebase configuration.`);
  }
}
