// src/config/env.js

const FIREBASE_KEYS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const getEnv = (key, fallback = "") => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      const value = import.meta.env[key];
      if (value !== undefined) return value;
    }
  } catch {
    // ignore
  }
  try {
    if (typeof process !== "undefined" && process.env) {
      const value = process.env[key];
      if (value !== undefined) return value;
    }
  } catch {
    // ignore
  }
  return fallback;
};

export const FIREBASE = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
  measurementId: getEnv("VITE_FIREBASE_MEASUREMENT_ID"),
};

export const missingFirebaseKeys = FIREBASE_KEYS.filter((key) => !getEnv(key));

export const isFirebaseConfigured = missingFirebaseKeys.length === 0;

export default { FIREBASE, isFirebaseConfigured, missingFirebaseKeys };
