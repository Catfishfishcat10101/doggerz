// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";
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
      "Populate .env.local or disable cloud features."
  );
};

let app = null;
let authInstance = null;
let dbInstance = null;
let googleProviderInstance = null;
let facebookProviderInstance = null;
let firebaseInitError = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    googleProviderInstance = new GoogleAuthProvider();
    facebookProviderInstance = new FacebookAuthProvider();
  } catch (err) {
    firebaseInitError = err;
    console.error("[Doggerz] Firebase initialization failed", err);
  }
} else {
  logMissingConfig();
}

export const firebaseReady = Boolean(
  app && authInstance && dbInstance && !firebaseInitError
);
export const firebaseMissingKeys = missingFirebaseKeys;
export const firebaseError = firebaseInitError;

export const auth = firebaseReady ? authInstance : null;
export const db = firebaseReady ? dbInstance : null;
export const googleProvider = firebaseReady ? googleProviderInstance : null;
export const facebookProvider = firebaseReady ? facebookProviderInstance : null;

export const assertFirebaseReady = (featureName = "this feature") => {
  if (firebaseReady) return;
  const missing = firebaseMissingKeys.length
    ? `Missing keys: ${firebaseMissingKeys.join(", ")}.`
    : firebaseError
    ? `Init error: ${firebaseError.message}`
    : "Unknown configuration issue.";
  throw new Error(`[Doggerz] ${featureName} requires Firebase. ${missing}`);
};
