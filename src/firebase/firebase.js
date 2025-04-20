// Import core Firebase modules
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBh4DTNape9A_Y_VLYKWwCJnycHtHP8hFY",
  authDomain: "doggerz-21b98.firebaseapp.com",
  projectId: "doggerz-21b98",
  storageBucket: "doggerz-21b98.firebasestorage.app",
  messagingSenderId: "1059201199223",
  appId: "1:1059201199223:web:60f5c0687656c26d502a72",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);

export { firebaseApp, auth, db };