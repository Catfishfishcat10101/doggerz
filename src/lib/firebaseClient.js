// src/lib/firebaseClient.js
// @ts-check

import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, firebaseReady, assertFirebaseReady } from "@/firebase.js";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

/**
 * Back-compat wrapper around the canonical firebase client in src/firebase.js
 * Keeps older imports working while preventing double initialization.
 */
export { auth, db };

let anonSignInPromise = null;

/**
 * Ensure there is an authenticated user (anonymous if needed).
 * Returns the current user (or null if Firebase is not available).
 */
export async function ensureAnonSignIn() {
  if (!firebaseReady || !auth) {
    console.warn(
      "[Doggerz] ensureAnonSignIn called but Firebase is not ready."
    );
    return null;
  }
  if (auth.currentUser) return auth.currentUser;

  if (!anonSignInPromise) {
    anonSignInPromise = signInAnonymously(auth)
      .catch((err) => {
        console.error("[Doggerz] Anonymous sign-in failed:", err);
        throw err;
      })
      .finally(() => {
        anonSignInPromise = null;
      });
  }

  const credential = await anonSignInPromise;
  return auth.currentUser || credential?.user || null;
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

  const ref = doc(db, "users", targetUid, "dog", "main");
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

  const ref = doc(db, "users", targetUid, "dog", "main");
  await setDoc(ref, dogState, { merge: true });
}
