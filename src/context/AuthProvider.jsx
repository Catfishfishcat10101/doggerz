// src/context/AuthProvider.jsx
import React, { createContext, useEffect, useMemo, useRef, useState, useContext } from "react";
import { onIdTokenChanged, getIdToken, getIdTokenResult, signOut } from "firebase/auth";
import { auth } from "@/firebase";
import { useDispatch } from "react-redux";
// FIX: use the configured alias "@"
import { setUser, clearUser } from "@/redux/userSlice";

/**
 * Shape:
 * {
 *   user: { id, email, displayName } | null,
 *   claims: object | null,
 *   token: string | null,          // current ID token
 *   loading: boolean,
 *   error: string | null,
 *   refresh: () => Promise<void>,  // force-refresh ID token
 *   signOutAndClear: () => Promise<void>
 * }
 */
const AuthCtx = createContext({
  user: null,
  claims: null,
  token: null,
  loading: true,
  error: null,
  refresh: async () => {},
  signOutAndClear: async () => {},
});

export default function AuthProvider({ children }) {
  const [user, setLocalUser] = useState(null);
  const [claims, setClaims] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const dispatch = useDispatch();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    // Use onIdTokenChanged to also catch token refreshes (~hourly) and profile updates
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      if (!mounted.current) return;
      try {
        setErr(null);
        if (fbUser) {
          // Pull a fresh token + claims
          const [idToken, result] = await Promise.all([
            getIdToken(fbUser, /* forceRefresh */ false),
            getIdTokenResult(fbUser),
          ]);
          const payload = {
            id: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || null,
          };
          dispatch(setUser(payload));
          setLocalUser(payload);
          setClaims(result?.claims || null);
          setToken(idToken);
        } else {
          dispatch(clearUser());
          setLocalUser(null);
          setClaims(null);
          setToken(null);
        }
      } catch (e) {
        // Non-fatal; keep UI usable
        setErr(e?.message || String(e));
      } finally {
        if (mounted.current) setLoading(false);
      }
    });

    return () => {
      mounted.current = false;
      unsub?.();
    };
  }, [dispatch]);

  const refresh = async () => {
    if (!auth.currentUser) return;
    try {
      const [idToken, result] = await Promise.all([
        getIdToken(auth.currentUser, /* forceRefresh */ true),
        getIdTokenResult(auth.currentUser),
      ]);
      if (!mounted.current) return;
      setToken(idToken);
      setClaims(result?.claims || null);
    } catch (e) {
      if (!mounted.current) return;
      setErr(e?.message || String(e));
    }
  };

  const signOutAndClear = async () => {
    try {
      await signOut(auth);
      // Redux + local state are cleared in the listener, but we defensively clear here too.
      dispatch(clearUser());
      setLocalUser(null);
      setClaims(null);
      setToken(null);
    } catch (e) {
      setErr(e?.message || String(e));
    }
  };

  const value = useMemo(
    () => ({
      user,
      claims,
      token,
      loading,
      error: err,
      refresh,
      signOutAndClear,
    }),
    [user, claims, token, loading, err]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuthCtx() {
  return useContext(AuthCtx);
}

/* ------------------------------------------------------------------ */
/* Optional helper: gate a subtree behind auth with a loading/fallback */
/* ------------------------------------------------------------------ */
export function AuthGate({ children, fallback = null, unauthenticated = null }) {
  const { user, loading } = useAuthCtx();
  if (loading) return fallback;
  if (!user) return unauthenticated;
  return children;
}
