// src/config/env.js

// exact VITE_* env var names we expect for Firebase
const REQUIRED_VITE_FIREBASE_VARS = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

// Optional env vars (UI + services) we may reference across the app.
const OPTIONAL_VITE_VARS = [
  "VITE_SUPPRESS_ENV_MISSING_WARNINGS",
  "VITE_FIREBASE_MEASUREMENT_ID",
  "VITE_WEATHER_API_KEY",
  "VITE_ADMOB_APP_ID",
  "VITE_ADMOB_BANNER_ID",
  "VITE_ADMOB_INTERSTITIAL_ID",
  "VITE_ADMOB_REWARDED_ID",
];

let VITE_ENV = {};

// Prefer import.meta.env (Vite runtime) but gracefully fall back to process.env (Node scripts)
try {
  VITE_ENV =
    typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env
      : typeof process !== "undefined" && process.env
        ? process.env
        : {};
} catch {
  VITE_ENV = typeof process !== "undefined" && process.env ? process.env : {};
}

const seenMissingKeys = new Set();
const isDevMode =
  (VITE_ENV &&
    (VITE_ENV.MODE === "development" || VITE_ENV.NODE_ENV === "development")) ||
  false;

const suppressWarnings =
  VITE_ENV &&
  String(
    VITE_ENV.VITE_SUPPRESS_ENV_MISSING_WARNINGS || "false"
  ).toLowerCase() === "true";

const warnMissingEnv = isDevMode && !suppressWarnings;

const getEnv = (name) =>
  VITE_ENV && Object.prototype.hasOwnProperty.call(VITE_ENV, name)
    ? VITE_ENV[name]
    : undefined;

const warnIfMissing = (name) => {
  const value = getEnv(name);
  if (!value && warnMissingEnv && !seenMissingKeys.has(name)) {
    seenMissingKeys.add(name);
    console.warn(
      `[env] Missing env var "${name}". Add it to .env.local as ${name}.`
    );
  }
  return value ?? undefined;
};

const warnIfMissingOptional = (name) => {
  const value = getEnv(name);
  if (!value && warnMissingEnv && !seenMissingKeys.has(name)) {
    seenMissingKeys.add(name);
    console.warn(`[env] Optional env var "${name}" is not set.`);
  }
  return value ?? undefined;
};

// Build FIREBASE config from VITE_* vars (do NOT hardcode secrets here)
export const FIREBASE = {
  apiKey: warnIfMissing("VITE_FIREBASE_API_KEY"),
  authDomain: warnIfMissing("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: warnIfMissing("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: warnIfMissing("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: warnIfMissing("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: warnIfMissing("VITE_FIREBASE_APP_ID"),
  measurementId:
    warnIfMissingOptional("VITE_FIREBASE_MEASUREMENT_ID") || undefined,
};

export const WEATHER = {
  apiKey: warnIfMissingOptional("VITE_WEATHER_API_KEY"),
};

export const ADMOB = {
  appId: warnIfMissingOptional("VITE_ADMOB_APP_ID"),
  bannerId: warnIfMissingOptional("VITE_ADMOB_BANNER_ID"),
  interstitialId: warnIfMissingOptional("VITE_ADMOB_INTERSTITIAL_ID"),
  rewardedId: warnIfMissingOptional("VITE_ADMOB_REWARDED_ID"),
};

// List missing VITE_* keys (actionable names)
export const missingFirebaseKeys = REQUIRED_VITE_FIREBASE_VARS.filter(
  (k) => !getEnv(k)
);

export const missingOptionalKeys = OPTIONAL_VITE_VARS.filter((k) => !getEnv(k));

// True when all required VITE_* firebase vars are present
export const isFirebaseConfigured = missingFirebaseKeys.length === 0;

export const isWeatherConfigured = Boolean(WEATHER.apiKey);
export const isAdmobConfigured = Boolean(ADMOB.appId);

// precommit-hook-test

// hook-smoke-test
