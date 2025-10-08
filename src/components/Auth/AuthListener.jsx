// src/components/Auth/AuthListener.jsx
import React, { useEffect } from "react";
import { auth } from "@/lib/firebase";
import {
  onIdTokenChanged,
  getRedirectResult,
} from "firebase/auth";
import { watchDog } from "@/data/dogRepo"; // optional prefetch; remove if not needed

// Redux wiring
import { useDispatch } from "react-redux";
import { userLoading, userAuthed, userCleared, userError } from "@/redux/userSlice";

// Shape the firebase.User into your app's user model
function shapeUser(u, claims) {
  if (!u) return null;
  const { uid, email, displayName, photoURL } = u;
  return {
    uid,
    email,
    displayName,
    photoURL,
    // optional: add claims you care about (roles, etc.)
    claims: claims || {},
  };
}

/**
 * AuthListener
 * Mount once near the root (e.g., inside RootLayout or App).
 * - Bridges Firebase auth to Redux
 * - Handles redirect results (Google on iOS / popup-blocked)
 * - Optionally warms related data (dog doc)
 */
export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!auth) return;

    let stopDog = null;

    // Handle signInWithRedirect resolution (no-op when none)
    getRedirectResult(auth).catch((err) => {
      if (import.meta.env.DEV) console.warn("[auth] redirect result error:", err);
      // non-fatal; we’ll still receive onIdTokenChanged
    });

    // Emit loading briefly on mount to avoid flicker
    dispatch(userLoading());

    const unSub = onIdTokenChanged(
      auth,
      async (firebaseUser) => {
        try {
          // User signed out
          if (!firebaseUser) {
            if (typeof stopDog === "function") {
              stopDog();
              stopDog = null;
            }
            dispatch(userCleared());
            return;
          }

          // Resolve claims (optional; useful for role-gating)
          let claims = {};
          try {
            const token = await firebaseUser.getIdTokenResult();
            claims = token?.claims || {};
          } catch (e) {
            if (import.meta.env.DEV) console.info("[auth] could not read claims:", e?.code || e?.message);
          }

          // Push normalized user to Redux
          const appUser = shapeUser(firebaseUser, claims);
          dispatch(userAuthed(appUser));

          // Optional: warm dog doc in the background so /game is instant
          if (!stopDog) {
            try {
              stopDog = watchDog(firebaseUser.uid, () => {
                // no-op: your dog slice can subscribe elsewhere if preferred
                // leaving this here will keep the connection warm
              });
            } catch (e) {
              if (import.meta.env.DEV) console.info("[dog] warm subscription failed:", e?.message || e);
            }
          }
        } catch (err) {
          dispatch(userError(err?.message || "Auth state error"));
          if (import.meta.env.DEV) console.error("[auth] state error:", err);
        }
      },
      (error) => {
        dispatch(userError(error?.message || "Auth listener error"));
        if (import.meta.env.DEV) console.error("[auth] listener error:", error);
      }
    );

    return () => {
      unSub?.();
      if (typeof stopDog === "function") stopDog();
    };
  }, [dispatch]);

  return null;
}
// End of src/components/Auth/AuthListener.jsx