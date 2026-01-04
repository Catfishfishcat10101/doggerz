/** @format */

// src/firebase.js
// Central Firebase bootstrap for Doggerz.
// Exports stable handles: app/auth/db (null if not configured).
// Provides assertFirebaseReady(context) used by paths/services.

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

import {
  FIREBASE,
  isFirebaseConfigured,
  missingFirebaseKeys,
} from "@/config/env.js";

// Stable exports (null until initialized)
export let app = null;
export let auth = null;
export let db = null;

// Public status exports used across UI + thunks
export let firebaseReady = false;
export let firebaseError = null;
export const firebaseMissingKeys = missingFirebaseKeys;

let _initError = null;
let _initialized = false;

/**
 * Initialize Firebase once (idempotent).
 * Safe to call multiple times.
 */
export function initFirebase() {
  if (_initialized) return { app, auth, db };
  _initialized = true;

  if (!isFirebaseConfigured) {
    // In dev, provide actionable message; in prod, keep quiet unless called explicitly.
    _initError = new Error(
      `[firebase] Not configured. Missing: ${missingFirebaseKeys.join(", ")}`
    );
    app = null;
    auth = null;
    db = null;
    firebaseError = _initError;
    firebaseReady = false;
    return { app, auth, db };
  }

  try {
    // Prevent duplicate init during hot reload
    app = getApps().length ? getApps()[0] : initializeApp(FIREBASE);

    auth = getAuth(app);
    db = getFirestore(app);

    _initError = null;
    firebaseError = null;
    firebaseReady = Boolean(app && auth && db);
    return { app, auth, db };
  } catch (e) {
    _initError = e;
    app = null;
    auth = null;
    db = null;
    firebaseError = _initError;
    firebaseReady = false;
    return { app, auth, db };
  }
}

/**
 * Assert Firebase is ready for Firestore/Auth operations.
 * Used by paths.js and data services.
 */
export function assertFirebaseReady(context = "Firebase") {
  // Make sure init attempted
  if (!_initialized) initFirebase();

  if (_initError) {
    throw new Error(`${context}: Firebase init failed: ${_initError.message}`);
  }
  if (!isFirebaseConfigured) {
    throw new Error(
      `${context}: Firebase env not configured. Missing: ${missingFirebaseKeys.join(", ")}`
    );
  }
  if (!app || !db) {
    throw new Error(`${context}: Firebase not initialized (app/db missing).`);
  }
  if (!firebaseReady) {
    throw new Error(`${context}: Firebase not ready.`);
  }
  return true;
}

// Initialize immediately so common imports work without extra calls.
// If env is missing, this will not crash; exports remain null until asserted.
initFirebase();
