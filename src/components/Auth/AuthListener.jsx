// src/components/Auth/AuthListener.jsx
import React, { useEffect } from "react";
import { onIdTokenChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "@/firebase";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/redux/userSlice";

/**
 * AuthListener
 * - Subscribes to Firebase auth state + token refreshes
 * - Writes a minimal, stable user object into Redux
 * - No visual output; mount once in main.jsx
 */
export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      if (!mounted) return;

      if (fbUser) {
        // Optional: warm claims (use later for role-gating)
        try { await getIdTokenResult(fbUser); } catch {}

        const payload = {
          id: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || null,
          photoURL: fbUser.photoURL || null,
        };
        dispatch(setUser(payload));
      } else {
        dispatch(clearUser());
      }
    });

    return () => {
      mounted = false;
      unsub?.();
    };
  }, [dispatch]);

  return null;
}
