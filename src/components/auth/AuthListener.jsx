// src/components/Auth/AuthListener.jsx
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useDispatch } from "react-redux";
import { userLoading, userAuthed, userError, userSignedOut } from "@/redux/userSlice";

function shapeUser(u) {
  if (!u) return null;
  const { uid, email, displayName, photoURL } = u;
  return { uid, email, displayName, photoURL };
}

export default function AuthListener({ children }) {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(userLoading());
    const unsub = onAuthStateChanged(
      auth,
      (u) => {
        if (u) {
          dispatch(userAuthed(shapeUser(u)));
        } else {
          dispatch(userSignedOut());
        }
      },
      (err) => {
        console.error("Auth listener error:", err);
        dispatch(userError(err.message || "Auth listener failed"));
      }
    );
    return () => unsub();
  }, [dispatch]);

  return children;
}
