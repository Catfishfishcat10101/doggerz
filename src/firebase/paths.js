/** @format */

// src/firebase/paths.js
import { doc, collection } from "firebase/firestore";
import { db, assertFirebaseReady } from "../firebase.js";

/* ------------------ internal helpers ------------------ */

function _validateUid(uid) {
  if (!uid || typeof uid !== "string") {
    throw new Error("firebase.paths: 'uid' must be a non-empty string");
  }
}

function _validateId(id, label = "id") {
  if (!id || typeof id !== "string") {
    throw new Error(`firebase.paths: '${label}' must be a non-empty string`);
  }
}

/* ------------------ user paths ------------------ */

/** /users/{uid} */
export function userDoc(uid) {
  _validateUid(uid);
  assertFirebaseReady("Firestore paths");
  return doc(db, "users", uid);
}

/* ------------------ dog root ------------------ */

/** /users/{uid}/dog/main */
export function dogMainDoc(uid) {
  _validateUid(uid);
  assertFirebaseReady("Firestore paths");
  return doc(db, "users", uid, "dog", "main");
}

/* ------------------ dog sub-documents ------------------ */

/** /users/{uid}/dog/stats */
export function dogStatsDoc(uid) {
  _validateUid(uid);
  assertFirebaseReady("Firestore paths");
  return doc(db, "users", uid, "dog", "stats");
}

/** /users/{uid}/dog/training */
export function dogTrainingDoc(uid) {
  _validateUid(uid);
  assertFirebaseReady("Firestore paths");
  return doc(db, "users", uid, "dog", "training");
}

/** /users/{uid}/dog/personality */
export function dogPersonalityDoc(uid) {
  _validateUid(uid);
  assertFirebaseReady("Firestore paths");
  return doc(db, "users", uid, "dog", "personality");
}

/** /users/{uid}/dog/progression */
export function dogProgressionDoc(uid) {
  _validateUid(uid);
  assertFirebaseReady("Firestore paths");
  return doc(db, "users", uid, "dog", "progression");
}

/* ------------------ dog collections ------------------ */

/** /users/{uid}/dog/journal */
export function dogJournalCol(uid) {
  _validateUid(uid);
  assertFirebaseReady("Firestore paths");
  return collection(db, "users", uid, "dog", "journal");
}

/** /users/{uid}/dog/journal/{entryId} */
export function dogJournalEntryDoc(uid, entryId) {
  _validateUid(uid);
  _validateId(entryId, "entryId");
  assertFirebaseReady("Firestore paths");
  return doc(db, "users", uid, "dog", "journal", entryId);
}

/** /users/{uid}/dog/events */
export function dogEventsCol(uid) {
  _validateUid(uid);
  assertFirebaseReady("Firestore paths");
  return collection(db, "users", uid, "dog", "events");
}

/** /users/{uid}/dog/events/{eventId} */
export function dogEventDoc(uid, eventId) {
  _validateUid(uid);
  _validateId(eventId, "eventId");
  assertFirebaseReady("Firestore paths");
  return doc(db, "users", uid, "dog", "events", eventId);
}
