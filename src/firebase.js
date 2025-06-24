import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrMD-vM_oOQz7BkXNawpxakclr-XMz7GA",
  authDomain: "doggerz-81f4b.firebaseapp.com",
  projectId: "doggerz-81f4b",
  storageBucket: "doggerz-81f4b.appsupport.com",
  messagingSenderId: "645903842930",
  appId: "1:645903842930:web:0b1235a451b803840f0ceb",
  measurementId: "G-G6P0LD65ZJ"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;