import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth, firebaseReady } from "@/lib/firebase/index.js";
import {
  clearUserAuth,
  setUser,
} from "@/store/userSlice.js";
import { debugError, debugLog } from "@/utils/debugLogger.js";

export default function AuthBootstrap() {
  const dispatch = useDispatch();
  const clearingAnonSessionRef = useRef(false);

  useEffect(() => {
    console.info("[Doggerz] Firebase runtime config", {
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || null,
      appId: import.meta.env.VITE_FIREBASE_APP_ID || null,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || null,
      firebaseReady,
    });
  }, []);

  useEffect(() => {
    if (!firebaseReady || !auth) {
      dispatch(clearUserAuth());
      return undefined;
    }

    let cancelled = false;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (user.isAnonymous) {
          if (!clearingAnonSessionRef.current) {
            clearingAnonSessionRef.current = true;
            try {
              await signOut(auth);
            } catch (err) {
              debugError("Auth", "anonymous session cleanup failed", err);
            }
          }
          if (cancelled) return;
          dispatch(clearUserAuth());
          debugLog("Auth", "auth state changed", { userId: null });
          console.info("[Doggerz] Auth resolved", {
            uid: null,
            anonymous: false,
          });
          return;
        }

        try {
          await user.getIdToken();
        } catch (err) {
          debugError("Auth", "auth token bootstrap failed", err);
        }
        if (cancelled) return;

        const createdAt = user?.metadata?.creationTime
          ? Date.parse(user.metadata.creationTime)
          : null;
        dispatch(
          setUser({
            id: user.uid,
            authResolved: true,
            displayName: user.displayName || "Trainer",
            email: user.email || null,
            avatarUrl: user.photoURL || null,
            createdAt: Number.isFinite(createdAt) ? createdAt : null,
          })
        );
        debugLog("Auth", "auth state changed", {
          userId: user.uid,
          anonymous: Boolean(user.isAnonymous),
        });
        console.info("[Doggerz] Auth resolved", {
          uid: user.uid,
          anonymous: Boolean(user.isAnonymous),
        });
        return;
      }

      clearingAnonSessionRef.current = false;
      dispatch(clearUserAuth());
      debugLog("Auth", "auth state changed", { userId: null });
      console.info("[Doggerz] Auth resolved", { uid: null, anonymous: false });
    });

    return () => {
      cancelled = true;
      try {
        unsub();
      } catch {
        // ignore
      }
    };
  }, [dispatch]);

  return null;
}
