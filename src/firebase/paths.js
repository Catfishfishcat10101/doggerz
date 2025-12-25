// src/firebase/paths.js
import { doc } from "firebase/firestore";
import { db, assertFirebaseReady } from "@/firebase.js";

/**
 * Validate uid argument
 */
function _validateUid(uid) {
  if (!uid || typeof uid !== "string") {
    throw new Error("firebase.paths: 'uid' must be a non-empty string");
  }
}

/**
 * Return a reference to the user document: /users/{uid}
 */
export function userDoc(uid) {
  _validateUid(uid);
  assertFirebaseReady("Firestore paths");
  return doc(db, "users", uid);
}

/**
 * Return a reference to the main dog document for a user: /users/{uid}/dog/main
 */
export function dogMainDoc(uid) {
  _validateUid(uid);
  assertFirebaseReady("Firestore paths");
  return doc(db, "users", uid, "dog", "main");
}
