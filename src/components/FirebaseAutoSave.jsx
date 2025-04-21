import { useEffect } from "react";
import { useSelector } from "react-redux";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { auth } from "../firebase";
import { loadState } from "../redux/dogSlice";
import { useDispatch } from "react-redux";

const FirebaseAutoSave = () => {
  const dogState = useSelector((state) => state.dog);
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      const ref = doc(db, "dogs", currentUser.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) dispatch(loadState(snap.data()));
    };
    fetchData();
  }, [currentUser, dispatch]);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      await setDoc(doc(db, "dogs", currentUser.uid), dogState);
      console.log("⏳ Saved to Firebase");
    }, 15000);
    return () => clearInterval(interval);
  }, [dogState, currentUser]);

  return null;
};

export default FirebaseAutoSave;
