/** @format */

// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import {
  FIREBASE as firebaseConfig,
  isFirebaseConfigured,
  missingFirebaseKeys,
} from './config/env.js';

let missingConfigWarned = false;

const logMissingConfig = () => {
  if (isFirebaseConfigured || missingConfigWarned) return;
  missingConfigWarned = true;
  const printable = missingFirebaseKeys.length
    ? missingFirebaseKeys.join(', ')
    : 'unknown';
  console.warn(
    `[Doggerz] Firebase disabled. Missing config keys: ${printable}. ` +
      'Populate .env.local or disable cloud features.'
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
    // Sensible defaults: always prompt account picker.
    googleProviderInstance.setCustomParameters({
      prompt: 'select_account',
    });
  } catch (err) {
    firebaseInitError = err;
    console.error('[Doggerz] Firebase initialization failed', err);
  }
} else {
  logMissingConfig();
}

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
  throw new Error(`[Doggerz] ${featureName} requires Firebase. ${missing}`);
};
