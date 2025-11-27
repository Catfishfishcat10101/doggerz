// src/firebase.js
// Doggerz: central Firebase wiring.
// - Reads config/env.js for Firebase config + missing keys info.
// - Initializes app once, or logs and runs in local-only mode if missing.

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  FIREBASE as firebaseConfig,
  isFirebaseConfigured,
  missingFirebaseKeys,
} from "./config/env.js";

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let firebaseInitError = null;

// Log once when config is missing
function logMissingConfigOnce() {
  const printable = missingFirebaseKeys.length
    ? missingFirebaseKeys.join(", ")
    : "unknown";
  console.warn(
    `[Doggerz] Firebase disabled. Missing config keys: ${printable}. ` +
      "Populate .env.local or disable cloud features.",
  );
}

// Single initialization path
if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
  } catch (err) {
    firebaseInitError = err;
    console.error("[Doggerz] Firebase initialization failed:", err);
  }
} else {
  logMissingConfigOnce();
}

// Ready flag used across the app
const firebaseReady = Boolean(app && auth && db && !firebaseInitError);

// Main exports
export { auth, db, googleProvider, firebaseReady };

// Extra debug exports (optional but handy)
export const firebaseMissingKeys = missingFirebaseKeys;
export const firebaseError = firebaseInitError;

/**
 * assertFirebaseReady
 * Throw a descriptive error if a cloud feature is used with Firebase disabled.
 *
 * Usage:
 *   assertFirebaseReady("Cloud save");
 *   // then call Firestore stuff
 */
export const assertFirebaseReady = (featureName = "this feature") => {
  if (firebaseReady) return;

  const missing = firebaseMissingKeys.length
    ? `Missing keys: ${firebaseMissingKeys.join(", ")}.`
    : firebaseError
      ? `Init error: ${firebaseError.message}`
      : "Unknown configuration issue.";

  throw new Error(`[Doggerz] ${featureName} requires Firebase. ${missing}`);
};
