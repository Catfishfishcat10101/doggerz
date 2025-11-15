// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBYN6XJEAiw6eVIChByegk9xcGLWIA0C1E",
  authDomain: "dogger-a8021.firebaseapp.com",
  projectId: "dogger-a8021",
  storageBucket: "dogger-a8021.firebasestorage.app",
  messagingSenderId: "1014835520506",
  appId: "1:1014835520506:web:6dc75cbe987d1dc10a3a43",
  measurementId: "G-VM8P3108DN"
};

const app = initializeApp(firebaseConfig);
const analtics = getAnalytics(app);
export const auth = getAuth(app);
