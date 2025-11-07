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
  signOut as fbSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/redux/userSlice";

function toErr(e) {
  return (e && (e.message || e.code)) || String(e);
}

const AuthCtx = createContext({
  user: null,
  userId: null,
  displayName: null,
  claims: null,
  token: null,
  isAuthed: false,
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
        setErr(toErr(e));
      } finally {
        if (mounted.current) setLoading(false);
      }
    });

    // Opportunistic refresh when tab gains focus – cheap and fixes stale-claim edges
    const onVisible = async () => {
      if (!mounted.current) return;
      if (document.visibilityState === "visible" && auth.currentUser) {
        try {
          const [idToken, result] = await Promise.all([
            getIdToken(auth.currentUser, /* forceRefresh */ false),
            getIdTokenResult(auth.currentUser),
          ]);
          if (!mounted.current) return;
          setToken(idToken);
          setClaims(result?.claims || null);
        } catch (e) {
          if (mounted.current) setErr(toErr(e));
        }
      }
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      mounted.current = false;
      unsub?.();
      document.removeEventListener("visibilitychange", onVisible);
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
      if (mounted.current) setErr(toErr(e));
    }
  };

  const signOutAndClear = async () => {
    try {
      await fbSignOut(auth);
      // listener will clear Redux; these lines make it instantaneous
      dispatch(clearUser());
      setLocalUser(null);
      setClaims(null);
      setToken(null);
    } catch (e) {
      setErr(toErr(e));
    }
  };

  const value = useMemo(
    () => ({
      user,
      userId: user?.id ?? null,
      displayName: user?.displayName ?? null,
      claims,
      token,
      isAuthed: !!user,
      loading,
      error: err,
      refresh,
      signOutAndClear,
    }),
    [user, claims, token, loading, err],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuthCtx() {
  return useContext(AuthCtx);
}

// Optional subtree gate (kept for ergonomics)
export function AuthGate({ children, fallback = null, unauthenticated = null }) {
  const { isAuthed, loading } = useAuthCtx();
  if (loading) return fallback;
  if (!isAuthed) return unauthenticated;
  return children;
}
