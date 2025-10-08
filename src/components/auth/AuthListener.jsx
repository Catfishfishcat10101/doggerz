// src/components/Auth/AuthListener.jsx
import React, { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { onIdTokenChanged, getRedirectResult } from "firebase/auth";

// Redux
import { useDispatch } from "react-redux";
import { userLoading, userAuthed, userCleared, userError } from "@/redux/userSlice";

// Optional: warm frequently-used data (safe to remove)
let stopDog = null;
async function warmDog(uid) {
  try {
    const { watchDog } = await import("@/data/dogRepo");
    stopDog = watchDog(uid, () => {});
  } catch { /* ignore if not present */ }
}

function shapeUser(u, claims) {
  if (!u) return null;
  const { uid, email, displayName, photoURL } = u;
  return { uid, email, displayName, photoURL, claims: claims || {} };
}

/**
 * Mount once (RootLayout/App).
 * - Bridges Firebase auth → Redux
 * - Handles redirect results
 * - Reads custom claims (if any)
 */
export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!auth) return;

    dispatch(userLoading());

    // Complete any pending redirect sign-in (noop if none)
    getRedirectResult(auth).catch((err) => {
      if (import.meta.env.DEV) console.warn("[auth] redirect result error:", err);
    });

    const unsub = onIdTokenChanged(
      auth,
      async (firebaseUser) => {
        try {
          if (!firebaseUser) {
            stopDog?.(); stopDog = null;
            dispatch(userCleared());
            return;
          }
          // Claims are optional; skip if you don't use them
          let claims = {};
          try {
            const token = await firebaseUser.getIdTokenResult();
            claims = token?.claims || {};
          } catch {}

          dispatch(userAuthed(shapeUser(firebaseUser, claims)));

          // Warm popular data paths
          if (!stopDog) warmDog(firebaseUser.uid);
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
      unsub?.();
      stopDog?.();
      stopDog = null;
    };
  }, [dispatch]);

  return null;
}
