// src/context/AuthProvider.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  onIdTokenChanged,
  getIdToken,
  getIdTokenResult,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/redux/userSlice";

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
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      if (!mounted.current) return;

      try {
        setErr(null);

        if (fbUser) {
          // Pull fresh token + claims (non-blocking UX)
          const [idToken, result] = await Promise.all([
            getIdToken(fbUser, /* forceRefresh */ false),
            getIdTokenResult(fbUser),
          ]);

          const payload = {
            id: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || null,
            photoURL: fbUser.photoURL || null,
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
      // Listener clears Redux, but we defensively clear local state as well
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
    [user, claims, token, loading, err],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

/** Hook */
export function useAuthCtx() {
  return useContext(AuthCtx);
}

/** Optional gate to protect subtrees/routes */
export function AuthGate({
  children,
  fallback = null,
  unauthenticated = null,
}) {
  const { user, loading } = useAuthCtx();
  if (loading) return fallback;
  if (!user) return unauthenticated;
  return children;
}
