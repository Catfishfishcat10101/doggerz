// safe firebase initializer — uses VITE_ env vars and avoids runtime crashes when placeholders are present
import { initializeApp } from 'firebase/app';

const cfg = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// do not initialize if apiKey is missing (prevents runtime crash with placeholder .env)
let app = null;
if (cfg.apiKey && cfg.apiKey !== 'yourKey') {
  try { app = initializeApp(cfg); } catch (e) { /* ignore in dev */ }
}

export default app;
export { cfg as firebaseConfig };