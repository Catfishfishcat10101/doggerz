// src/firebase.js
// @ts-nocheck

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  FIREBASE,
  isFirebaseConfigured,
  missingFirebaseKeys,
} from "@/config/env.js";

let app = null;
let auth = null;
let db = null;
let firebaseReady = false;

if (isFirebaseConfigured) {
  app = initializeApp(FIREBASE);
  auth = getAuth(app);
  db = getFirestore(app);
  firebaseReady = true;
} else {
  if (import.meta.env.DEV) {
    console.warn(
      `[firebase] Not initialized. Missing keys: ${missingFirebaseKeys.join(
        ", ",
      )}`,
    );
  }
}

export { app, auth, db, firebaseReady };
