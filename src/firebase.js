// src/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
} from "firebase/auth";

// Pull config from Vite env vars
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Safety check in dev so we don’t silently run with junk config
if (import.meta.env.DEV) {
  if (!firebaseConfig.apiKey) {
    console.warn(
      "[Doggerz] Firebase API key missing. Check your .env.local (VITE_FIREBASE_API_KEY)."
    );
  } else {
    console.info("[Doggerz] Firebase configured for project:", {
      projectId: firebaseConfig.projectId,
      authDomain: firebaseConfig.authDomain,
    });
  }
}

// Initialize Firebase app (singleton)
const app = initializeApp(firebaseConfig);

// Auth + providers
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

export const facebookProvider = new FacebookAuthProvider();

// Default export if you ever need the raw app
export default app;
