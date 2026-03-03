//src/firebase/firebase.js
// Back-compat re-export.
// Keep legacy imports pointed at the canonical Firebase bootstrap.
export {
  app,
  auth,
  db,
  firebaseReady,
  firebaseError,
  firebaseMissingKeys,
  initFirebase,
  assertFirebaseReady,
} from "../firebase.js";
