// src/lib/firebaseClient.js
// @ts-check

import { getDoc, setDoc } from "firebase/firestore";
import {
  auth,
  db,
  firebaseReady,
  assertFirebaseReady,
} from "@/lib/firebase/index.js";
import { onAuthStateChanged } from "firebase/auth";
import { dogMainDoc } from "@/lib/firebase/paths.js";

/**
 * Back-compat wrapper around the canonical firebase client in src/firebase.js
 * Keeps older imports working while preventing double initialization.
 */
export { auth, db };

export function isAnonymousFirebaseUser(user) {
  return Boolean(user?.isAnonymous);
}

export function isFirestorePermissionError(error) {
  const code = String(error?.code || "")
    .trim()
    .toLowerCase();
  const message = String(error?.message || "")
    .trim()
    .toLowerCase();

  return (
    code.includes("permission-denied") ||
    message.includes("missing or insufficient permissions")
  );
}

/**
 * Legacy compatibility helper.
 * Returns the existing authenticated user if present, but never creates an
 * anonymous session implicitly.
 */
export async function ensureAnonSignIn() {
  if (!firebaseReady || !auth) {
    console.warn(
      "[Doggerz] ensureAnonSignIn called but Firebase is not ready."
    );
    return null;
  }
  return auth?.currentUser || null;
}

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function.
 */
export function subscribeToAuth(callback) {
  if (!firebaseReady || !auth) {
    console.warn("[Doggerz] subscribeToAuth called but Firebase is not ready.");
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}

/**
 * Load the canonical dog document for a given user UID.
 */
export async function loadDogForUser(uid) {
  assertFirebaseReady("Dog save data");
  const user = await ensureAnonSignIn();
  const targetUid = uid || user?.uid;
  if (!targetUid) return null;

  const ref = dogMainDoc(targetUid);
  if (!ref) return null;
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

/**
 * Save the canonical dog document for a given user UID.
 * Uses merge:true so we don't blow away unknown fields.
 */
export async function saveDogForUser(uid, dogState) {
  assertFirebaseReady("Dog save data");
  const user = await ensureAnonSignIn();
  const targetUid = uid || user?.uid;
  if (!targetUid) return;
  if (!dogState || typeof dogState !== "object") return;

  const ref = dogMainDoc(targetUid);
  if (!ref) return;
  await setDoc(ref, dogState, { merge: true });
}
