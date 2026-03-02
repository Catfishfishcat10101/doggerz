/** @format */
// src/config/firebaseSetup.js

import { getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FIREBASE, isFirebaseConfigured } from "./env.js";

let app = null;
let db = null;
let auth = null;

// Initialize only when env keys exist so local dev does not crash.
if (isFirebaseConfigured) {
  const existing = getApps();
  app = existing.length ? existing[0] : initializeApp(FIREBASE);
  db = getFirestore(app);
  auth = getAuth(app);
  console.info("[Doggerz] Firebase initialized.");
} else {
  console.warn("[Doggerz] Firebase missing keys. Check .env.");
}

export { app, db, auth };
