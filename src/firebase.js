// src/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  connectAuthEmulator,
  GoogleAuthProvider,
} from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const cfg = {
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FB_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FB_APP_ID,
};

// Fail fast in dev if obviously broken – avoids silent “network error”
if (import.meta.env.DEV) {
  ["apiKey", "projectId"].forEach((k) => {
    if (!cfg[k]) {
      // eslint-disable-next-line no-console
      console.error(`❌ Missing Firebase env: ${k}`);
    }
  });
  // eslint-disable-next-line no-console
  console.info("[Firebase] cfg summary", {
    hasApiKey: !!cfg.apiKey,
    authDomain: cfg.authDomain,
    projectId: cfg.projectId,
  });
}

const app = getApps().length ? getApp() : initializeApp(cfg);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

setPersistence(auth, browserLocalPersistence).catch((e) => {
  // eslint-disable-next-line no-console
  console.warn("Auth persistence failed:", e?.code || e?.message || e);
});

// Toggle emulators via env (explicit beats implicit)
export const isEmulator =
  String(import.meta.env.VITE_USE_FIREBASE_EMULATOR) === "1";

if (isEmulator) {
  // eslint-disable-next-line no-console
  console.warn("⚠️ Using Firebase emulators (auth:9099, firestore:8080)");
  // Use 127.0.0.1 to dodge odd localhost resolution in some stacks
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
