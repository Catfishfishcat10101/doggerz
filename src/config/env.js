// src/config/env.js

function warnIfMissing(value, key) {
  if (!value) {
    console.warn(
      `[env] Missing env var "${key}". Check your .env.local (VITE_${key}).`
    );
  }
  return value;
}

export const FIREBASE = {
  apiKey: warnIfMissing(import.meta.env.VITE_FIREBASE_API_KEY, "FIREBASE_API_KEY"),
  authDomain: warnIfMissing(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN, "FIREBASE_AUTH_DOMAIN"),
  projectId: warnIfMissing(import.meta.env.VITE_FIREBASE_PROJECT_ID, "FIREBASE_PROJECT_ID"),
  storageBucket: warnIfMissing(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    "FIREBASE_STORAGE_BUCKET"
  ),
  messagingSenderId: warnIfMissing(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    "MESSAGING_SENDER_ID"
  ),
  appId: warnIfMissing(import.meta.env.VITE_FIREBASE_APP_ID, "FIREBASE_APP_ID"),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};
