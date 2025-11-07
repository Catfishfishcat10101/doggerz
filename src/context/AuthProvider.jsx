// src/context/AuthProvider.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  signOut as fbSignOut,
} from "firebase/auth";
import { auth, googleProvider } from "../utils/firebase";

/**
 * Global Auth context for Doggerz
 * - Persists session (browserLocalPersistence)
 * - Exposes { user, isLoading, signInWithGoogle, signOut, getIdToken }
 * - Alias-safe (relative imports)
 */

const AuthContext = createContext({
  user: null,
  isLoading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  getIdToken: async () => null,
});

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setLoading] = useState(true);

  // Subscribe to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      /** Google sign-in with durable persistence */
      async signInWithGoogle() {
        await setPersistence(auth, browserLocalPersistence);
        const { user: u } = await signInWithPopup(auth, googleProvider);
        return u;
      },
      /** Sign out */
      async signOut() {
        await fbSignOut(auth);
      },
      /** Get Firebase ID token (JWT) for API calls */
      async getIdToken(forceRefresh = false) {
        const u = auth.currentUser;
        return u ? await u.getIdToken(forceRefresh) : null;
      },
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/* ------------------------------------------------------------------ */
/* Optional helper: gate children until auth finishes bootstrapping.  */
/* Usage: <AuthGate><AppRoutes/></AuthGate>                            */
/* ------------------------------------------------------------------ */
export function AuthGate({ children, fallback = null }) {
  const { isLoading } = useAuth();
  if (isLoading) {
    return (
      fallback ?? (
        <div className="min-h-dvh grid place-items-center bg-[#0b1020] text-white">
          <div className="animate-pulse text-white/70">Loading…</div>
        </div>
      )
    );
  }
  return children;
}
```0