import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR-KEY",
  authDomain: "YOUR-APP.firebaseapp.com",
  projectId: "YOUR-PROJECT-ID",
  storageBucket: "YOUR.appspot.com",
  messagingSenderId: "YOUR-ID",
  appId: "YOUR-APP-ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence); // This line enables session persistence
const db = getFirestore(app);

export { auth, db };