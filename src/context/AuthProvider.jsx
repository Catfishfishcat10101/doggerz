import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

// Keep the shape stable so consumers don't crash if fields are briefly undefined.
const AuthCtx = createContext({
  user: null,
  loading: true,
  // eslint-disable-next-line no-unused-vars
  setUser: (_u) => {},
});

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);   // TODO: wire to Firebase onAuthStateChanged
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // simulate async auth bootstrap; replace with real listener
    // e.g. onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
    setLoading(false);
  }, []);

  const value = useMemo(() => ({ user, setUser, loading }), [user, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

// ✅ Named export: this must exist if you import { useAuth } …
export const useAuth = () => useContext(AuthCtx);
