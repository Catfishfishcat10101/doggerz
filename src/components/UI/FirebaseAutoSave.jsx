import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { loadState } from "../../redux/dogSlice";

const FirebaseAutoSave = () => {
  const dogState = useSelector((state) => state.dog);
  const currentUser = useSelector((state) => state.user.currentUser);
  const dispatch = useDispatch();

  // 🔁 Load state from Firebase on mount
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.uid) return;
      try {
        const ref = doc(db, "dogs", currentUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          dispatch(loadState(snap.data()));
        }
      } catch (error) {
        console.error("Failed to load dog state from Firebase:", error);
      }
    };

    fetchData();
  }, [currentUser, dispatch]);

  // 💾 Save state to Firebase every 15 seconds
  useEffect(() => {
    if (!currentUser?.uid) return;

    const saveInterval = setInterval(async () => {
      try {
        await setDoc(doc(db, "dogs", currentUser.uid), dogState);
        console.log("⏳ Auto-saved dog state to Firebase");
      } catch (error) {
        console.error("❌ Failed to auto-save dog state:", error);
      }
    }, 15000);

    return () => clearInterval(saveInterval);
  }, [dogState, currentUser]);

  return null;
};

export default FirebaseAutoSave;
