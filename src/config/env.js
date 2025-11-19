// src/config/env.js

const seenMissingKeys = new Set();
const warnMissingEnv = Boolean(
  import.meta.env.DEV &&
    (import.meta.env.VITE_SUPPRESS_ENV_MISSING_WARNINGS ?? "false") !== "true"
);

const warnIfMissing = (value, key) => {
  if (!value && warnMissingEnv && !seenMissingKeys.has(key)) {
    seenMissingKeys.add(key);
    console.warn(
      `[env] Missing env var "${key}". Check your .env.local (VITE_${key}).`
    );
  }
  return value ?? undefined;
};

export const FIREBASE = {
  apiKey: warnIfMissing(
    import.meta.env.VITE_FIREBASE_API_KEY,
    "FIREBASE_API_KEY"
  ),
  authDomain: warnIfMissing(
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    "FIREBASE_AUTH_DOMAIN"
  ),
  projectId: warnIfMissing(
    import.meta.env.VITE_FIREBASE_PROJECT_ID,
    "FIREBASE_PROJECT_ID"
  ),
  storageBucket: warnIfMissing(
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    "FIREBASE_STORAGE_BUCKET"
  ),
  messagingSenderId: warnIfMissing(
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    "FIREBASE_MESSAGING_SENDER_ID"
  ),
  appId: warnIfMissing(import.meta.env.VITE_FIREBASE_APP_ID, "FIREBASE_APP_ID"),
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

const REQUIRED_FIREBASE_KEYS = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
];

export const missingFirebaseKeys = REQUIRED_FIREBASE_KEYS.filter(
  (key) => !FIREBASE[key]
);

export const isFirebaseConfigured = missingFirebaseKeys.length === 0;
