// src/config/env.js

// Small helper so this module also works if you ever run under CRA/node:
const readEnv = (k) =>
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[k]) ??
  (typeof process !== "undefined" && process.env && process.env[k]) ??
  undefined;

function warnIfMissing(obj, sectionName) {
  const missing = Object.entries(obj)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  if (missing.length && typeof console !== "undefined") {
    console.warn(`[env] Missing ${sectionName} keys: ${missing.join(", ")}`);
  }
}

export const FIREBASE = {
  apiKey:             readEnv("VITE_FIREBASE_API_KEY") || readEnv("REACT_APP_FIREBASE_API_KEY"),
  authDomain:         readEnv("VITE_FIREBASE_AUTH_DOMAIN") || readEnv("REACT_APP_FIREBASE_AUTH_DOMAIN"),
  projectId:          readEnv("VITE_FIREBASE_PROJECT_ID") || readEnv("REACT_APP_FIREBASE_PROJECT_ID"),
  appId:              readEnv("VITE_FIREBASE_APP_ID") || readEnv("REACT_APP_FIREBASE_APP_ID"),
  messagingSenderId:  readEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") || readEnv("REACT_APP_FIREBASE_MESSAGING_SENDER_ID"),
  measurementId:      readEnv("VITE_FIREBASE_MEASUREMENT_ID") || readEnv("REACT_APP_FIREBASE_MEASUREMENT_ID"),
};
warnIfMissing(FIREBASE, "FIREBASE");

// App metadata:
// - With Vite, we’ll inject __APP_VERSION__ in vite.config.js (below).
// - Fallback to VITE_APP_VERSION / REACT_APP_APP_VERSION / '0.0.0'
const injectedVersion =
  (typeof __APP_VERSION__ !== "undefined" && __APP_VERSION__) ||
  readEnv("VITE_APP_VERSION") ||
  readEnv("REACT_APP_APP_VERSION") ||
  "0.0.0";

export const APP = {
  name: "Doggerz",
  version: injectedVersion,
};
