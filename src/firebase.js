// @ts-nocheck
// src/firebase.js
//
// Centralized Firebase initialization for Doggerz.
// - Uses Vite env via src/config/env.js (no hard-coded secrets)
// - Safely handles "Firebase not configured" and local-only mode
// - Exposes auth, db, googleProvider, messaging, and helper flags

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  getMessaging,
  onMessage,
  getToken,
  isSupported as isMessagingSupported,
} from "firebase/messaging";

import {
  FIREBASE as firebaseConfig,
  isFirebaseConfigured,
  missingFirebaseKeys,
} from "@/config/env.js";

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let messagingInstance = null;
let firebaseInitError = null;
let firebaseReady = false;

// One-time warning about missing config
let missingConfigWarned = false;
const logMissingConfig = () => {
  if (isFirebaseConfigured || missingConfigWarned) return;
  missingConfigWarned = true;
  const printable = missingFirebaseKeys.length
    ? missingFirebaseKeys.join(", ")
    : "unknown";
  console.warn(
    `[Doggerz] Firebase disabled. Missing config keys: ${printable}. ` +
      "Populate .env.local (VITE_FIREBASE_*) or cloud features will be off.",
  );
};

if (isFirebaseConfigured) {
  try {
    // Initialize core Firebase services
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    // Google Auth provider with sensible defaults
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });

    firebaseReady = true;

    // Messaging (push notifications) is optional
    // Only try to wire it up if supported
    isMessagingSupported()
      .then((supported) => {
        if (!supported) return;
        if (!app) return;
        messagingInstance = getMessaging(app);
      })
      .catch((err) => {
        console.warn("[Doggerz] Firebase messaging not available:", err);
      });
  } catch (err) {
    firebaseInitError = err;
    firebaseReady = false;
    console.error("[Doggerz] Firebase initialization failed", err);
  }
} else {
  logMissingConfig();
  firebaseReady = false;
}

// Public exports used across the app
export { auth, db, googleProvider, firebaseReady };

// Messaging-related exports
export const messaging = messagingInstance;
export const isPushSupported = isMessagingSupported;
export { onMessage, getToken };

// Config + error helpers
export const firebaseMissingKeys = missingFirebaseKeys;
export const firebaseError = firebaseInitError;

/**
 * Throw a clear error if a feature requires Firebase but it
 * is not configured or failed to initialize.
 */
export const assertFirebaseReady = (featureName = "this feature") => {
  if (firebaseReady) return;

  const missing = firebaseMissingKeys.length
    ? `Missing keys: ${firebaseMissingKeys.join(", ")}.`
    : firebaseError
      ? `Init error: ${firebaseError.message}`
      : "Unknown configuration issue.";

  throw new Error(
    `[Doggerz] ${featureName} requires Firebase to be configured. ${missing}`,
  );
};
