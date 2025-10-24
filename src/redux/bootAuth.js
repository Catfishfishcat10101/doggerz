// src/redux/bootAuth.js
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { userAuthed, userSignedOut, userLoading } from "./userSlice";

/** Attach a single global auth listener; call this once from main.jsx */
export function attachAuthListener(store) {
  store.dispatch(userLoading());
  onAuthStateChanged(auth, (u) => {
    if (u) {
      const { uid, email, displayName, photoURL } = u;
      store.dispatch(userAuthed({ uid, email, displayName, photoURL }));
    } else {
      store.dispatch(userSignedOut());
    }
  });
}
