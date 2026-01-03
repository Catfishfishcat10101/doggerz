<<<<<<< HEAD
// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
=======
/** @format */

// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
>>>>>>> master
import {
  FIREBASE as firebaseConfig,
  isFirebaseConfigured,
  missingFirebaseKeys,
<<<<<<< HEAD
} from "./config/env.js";
=======
} from './config/env.js';
>>>>>>> master

let missingConfigWarned = false;

const logMissingConfig = () => {
  if (isFirebaseConfigured || missingConfigWarned) return;
  missingConfigWarned = true;
  const printable = missingFirebaseKeys.length
<<<<<<< HEAD
    ? missingFirebaseKeys.join(", ")
    : "unknown";
  console.warn(
    `[Doggerz] Firebase disabled. Missing config keys: ${printable}. ` +
      "Populate .env.local or disable cloud features.",
=======
    ? missingFirebaseKeys.join(', ')
    : 'unknown';
  console.warn(
    `[Doggerz] Firebase disabled. Missing config keys: ${printable}. ` +
      'Populate .env.local or disable cloud features.'
>>>>>>> master
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
<<<<<<< HEAD
  } catch (err) {
    firebaseInitError = err;
    console.error("[Doggerz] Firebase initialization failed", err);
=======
    // Sensible defaults: always prompt account picker.
    googleProviderInstance.setCustomParameters({
      prompt: 'select_account',
    });
  } catch (err) {
    firebaseInitError = err;
    console.error('[Doggerz] Firebase initialization failed', err);
>>>>>>> master
  }
} else {
  logMissingConfig();
}

<<<<<<< HEAD
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
=======
export const firebaseReady = Boolean(
  app &&
    authInstance &&
    dbInstance &&
    googleProviderInstance &&
    !firebaseInitError
);

// Public exports used across the app. These are null in local-only mode.
export const auth = firebaseReady ? authInstance : null;
export const db = firebaseReady ? dbInstance : null;
export const googleProvider = firebaseReady ? googleProviderInstance : null;
export const firebaseMissingKeys = missingFirebaseKeys;
export const firebaseError = firebaseInitError;

export const assertFirebaseReady = (featureName = 'this feature') => {
  if (firebaseReady) return;
  const missing = firebaseMissingKeys.length
    ? `Missing keys: ${firebaseMissingKeys.join(', ')}.`
    : firebaseError
    ? `Init error: ${firebaseError.message}`
    : 'Unknown configuration issue.';
>>>>>>> master
  throw new Error(`[Doggerz] ${featureName} requires Firebase. ${missing}`);
};
