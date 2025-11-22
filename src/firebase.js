// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import {
  FIREBASE as firebaseConfig,
  isFirebaseConfigured,
  missingFirebaseKeys,
} from "@/config/firebaseConfig.js";

let missingConfigWarned = false;

const logMissingConfig = () => {
  if (isFirebaseConfigured || missingConfigWarned) return;
  missingConfigWarned = true;
  const printable = missingFirebaseKeys.length
    ? missingFirebaseKeys.join(", ")
    : "unknown";
  console.warn(
    `[Doggerz] Firebase disabled. Missing config keys: ${printable}. ` +
      "Populate .env.local or disable cloud features."
  );
};

let app = null;
let authInstance = null;
let dbInstance = null;
let googleProviderInstance = null;
let firebaseInitError = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
    dbInstance = getFirestore(app);
    googleProviderInstance = new GoogleAuthProvider();
  } catch (err) {
    firebaseInitError = err;
    console.error("[Doggerz] Firebase initialization failed", err);
  }
} else {
  logMissingConfig();
}

let auth = null;
let db = null;
let googleProvider = null;

// Use the existing firebaseReady logic from the first initialization
const firebaseReady = Boolean(
  app && authInstance && dbInstance && !firebaseInitError
);

try {
  // Check for required env vars
  const requiredVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN",
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID",
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.warn("Firebase: Missing environment variables:", missingVars);
    console.warn("App will run in local-only mode (localStorage only)");
  } else if (!firebaseReady) {
    // Only initialize if the first initialization failed
    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };

    const fallbackApp = initializeApp(firebaseConfig);
    auth = getAuth(fallbackApp);
    db = getFirestore(fallbackApp);

    // Initialize Google provider with proper popup configuration
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });

    console.log("Firebase initialized successfully (fallback)");
  } else {
    // Use the instances from the first successful initialization
    auth = authInstance;
    db = dbInstance;
    googleProvider = googleProviderInstance;
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
  console.warn("Firebase features disabled. App will use localStorage only.");
}

export { auth, db, googleProvider, firebaseReady };
export const firebaseMissingKeys = missingFirebaseKeys;
export const firebaseError = firebaseInitError;

export const assertFirebaseReady = (featureName = "this feature") => {
  if (firebaseReady) return;
  const missing = firebaseMissingKeys.length
    ? `Missing keys: ${firebaseMissingKeys.join(", ")}.`
    : firebaseError
    ? `Init error: ${firebaseError.message}`
    : "Unknown configuration issue.";
  throw new Error(`[Doggerz] ${featureName} requires Firebase. ${missing}`);
};
