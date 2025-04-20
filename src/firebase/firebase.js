// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBh4DTNape9A_Y_VLYKWwCJnycHtHP8hFY",
  authDomain: "doggerz-21b98.firebaseapp.com",
  projectId: "doggerz-21b98",
  storageBucket: "doggerz-21b98.firebasestorage.app",
  messagingSenderId: "1059201199223",
  appId: "1:1059201199223:web:60f5c0687656c26d502a72",
  measurementId: "G-3S1QGXF330"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);