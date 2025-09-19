import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, signOut } from "../../redux/userSlice";

export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    // Avoid duplicate subscription during React 18 dev StrictMode re-mounts
    if (import.meta.env.DEV) {
      if (window.__AUTH_LISTENER_ATTACHED__) return;
      window.__AUTH_LISTENER_ATTACHED__ = true;
    }

    let unsub = null;
    (async () => {
      try {
        const { auth } = await import("../../firebase");
        const { onAuthStateChanged } = await import("firebase/auth");

        unsub = onAuthStateChanged(auth, (user) => {
          if (user) {
            dispatch(
              setUser({
                uid: user.uid,
                email: user.email || null,
                displayName: user.displayName || null,
              })
            );
            console.log("[AuthListener] user:", user.uid);
          } else {
            dispatch(signOut());
            console.log("[AuthListener] user: signed out");
          }
        });
      } catch (e) {
        console.info("[AuthListener] Firebase not available — skipping.", e?.message || e);
      }
    })();

    return () => { if (typeof unsub === "function") unsub(); };
  }, [dispatch]);

  return null;
}
// src/router.jsx