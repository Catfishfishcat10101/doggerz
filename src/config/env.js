// Read-only view of environment with sane defaults.
// Vite exposes only VITE_* at build time.
const bool = (v, d = false) => {
  if (v === undefined || v === null || v === "") return d;
  return ["1", "true", "yes", "on"].includes(String(v).toLowerCase());
};

const str = (v, d = "") => (v == null || v === "" ? d : String(v));

export const MODE = import.meta.env.MODE;             // "development"|"production"|"test"
export const DEV = MODE === "development";
export const PROD = MODE === "production";

// App
export const APP_NAME = str(import.meta.env.VITE_APP_NAME, "Doggerz");
export const ENV = str(import.meta.env.VITE_ENV, DEV ? "dev" : "prod");

// Firebase (optional until you wire real values)
export const FIREBASE = Object.freeze({
  apiKey: str(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: str(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: str(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  appId: str(import.meta.env.VITE_FIREBASE_APP_ID),
  messagingSenderId: str(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  measurementId: str(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
});

// PWA
export const PWA_ENABLED = bool(import.meta.env.VITE_PWA_ENABLED, true);

// Diagnostics
export const LOG_LEVEL = str(import.meta.env.VITE_LOG_LEVEL, "info"); // "debug"|"info"|"warn"|"error"

Object.freeze(FIREBASE);
Object.freeze(MODE);
Object.freeze(LOG_LEVEL);
Object.freeze(ENV);
Object.freeze(APP_NAME);
Object.freeze(PWA_ENABLED);
Object.freeze(DEV);
Object.freeze(PROD);