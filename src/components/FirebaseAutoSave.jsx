import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { auth, db } from "../firebase/firebase";
import { doc, setDoc } from "firebase/firestore";

const FirebaseAutoSave = () => {
  const dogState = useSelector((state) => state.dog);
  const currentUser = auth.currentUser;

  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(() => {
      const save = async () => {
        try {
          await setDoc(doc(db, "dogs", currentUser.uid), dogState);
          console.log("Dog state auto-saved to Firestore.");
        } catch (err) {
          console.error("Auto-save failed:", err);
        }
      };
      save();
    }, 15000); // save every 15s

    return () => clearInterval(interval);
  }, [dogState, currentUser]);

  return null;
};

export default FirebaseAutoSave;
