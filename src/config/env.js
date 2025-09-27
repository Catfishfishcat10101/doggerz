const get = (k, fallback = undefined) => import.meta.env[k] ?? fallback;
export const ENV = Object.freeze({
  MODE: import.meta.env.MODE,
  DEV: import.meta.env.DEV === true,
  PROD: import.meta.env.PROD === true,
  FIREBASE: {
    apiKey:            get("VITE_FIREBASE_API_KEY", ""),
    authDomain:        get("VITE_FIREBASE_AUTH_DOMAIN", ""),
    projectId:         get("VITE_FIREBASE_PROJECT_ID", ""),
    storageBucket:     get("VITE_FIREBASE_STORAGE_BUCKET", ""),
    messagingSenderId: get("VITE_FIREBASE_MESSAGING_SENDER_ID", ""),
    appId:             get("VITE_FIREBASE_APP_ID", ""),
    measurementId:     get("VITE_FIREBASE_MEASUREMENT_ID", ""),
  },
  USE_EMULATORS: get("VITE_USE_EMULATORS", "0") === "1",
  ANALYZE_BUNDLE: get("VITE_ANALYZE", "0") === "1",
});
