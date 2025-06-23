import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBh4DTNape9A_Y_VLYKWwCJnycHtHP8hFY",
  authDomain: "doggerz-21b98.firebaseapp.com",
  projectId: "doggerz-21b98",
  storageBucket: "doggerz-21b98.firebasestorage.app",
  messagingSenderId: "1059201199223",
  appId: "1:1059201199223:web:60f5c0687656c26d502a72",
  measurementId: "G-3S1QGXF330"
};

const app  = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
export { signInWithEmailAndPassword } from "firebase/auth";
