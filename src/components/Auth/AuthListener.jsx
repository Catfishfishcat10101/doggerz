import React, { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";          // ✅ correct path
// If using Redux, uncomment these:
// import { useDispatch } from "react-redux";
// import { setUser, clearUser } from "@/redux/userSlice.js";

export default function AuthListener() {
  // const dispatch = useDispatch();
  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      // if (user) dispatch(setUser({ uid: user.uid, email: user.email, displayName: user.displayName }));
      // else dispatch(clearUser());
    });
    return () => unsub();
  }, []);
  return null;
}
