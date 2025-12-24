// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  FIREBASE as firebaseConfig,
  isFirebaseConfigured,
  missingFirebaseKeys,
} from "./config/env.js";

let missingConfigWarned = false;

const logMissingConfig = () => {
  if (isFirebaseConfigured || missingConfigWarned) return;
  missingConfigWarned = true;
  const printable = missingFirebaseKeys.length
    ? missingFirebaseKeys.join(", ")
    : "unknown";
  console.warn(
    `[Doggerz] Firebase disabled. Missing config keys: ${printable}. ` +
      "Populate .env.local or disable cloud features.",
  );
};

let app = null;
let authInstance = null;
let dbInstance = null;
let googleProviderInstance = null;
let firebaseInitError = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    googleProviderInstance = new GoogleAuthProvider();
  } catch (err) {
    firebaseInitError = err;
    console.error("[Doggerz] Firebase initialization failed", err);
  }
} else {
  logMissingConfig();
}

// Exported instances are either fully initialized or null (local-only mode).
const firebaseReady = Boolean(
  isFirebaseConfigured &&
    app &&
    authInstance &&
    dbInstance &&
    !firebaseInitError
);

const auth = firebaseReady ? authInstance : null;
const db = firebaseReady ? dbInstance : null;

// Provider is only meaningful when Firebase is ready.
const googleProvider = firebaseReady ? googleProviderInstance : null;

// Ensure a consistent popup prompt (safe no-op if provider is null).
try {
  googleProvider?.setCustomParameters?.({ prompt: "select_account" });
} catch (e) {
  // ignore
}

export { auth, db, googleProvider, firebaseReady };
export const firebaseMissingKeys = missingFirebaseKeys;
export const firebaseError = firebaseInitError;

export const assertFirebaseReady = (featureName = "this feature") => {
  if (firebaseReady) return;
  const missing = firebaseMissingKeys.length
    ? `Missing keys: ${firebaseMissingKeys.join(", ")}.`
    : firebaseError
      ? `Init error: ${firebaseError.message}`
      : "Unknown configuration issue.";
  throw new Error(`[Doggerz] ${featureName} requires Firebase. ${missing}`);
};
