import React, { createContext, useEffect, useState, useMemo, useContext } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@redux/userSlice";

const AuthCtx = createContext({ user: null, loading: true });

export default function AuthProvider({ children }) {
  const [user, setLocalUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        const payload = { id: u.uid, email: u.email, displayName: u.displayName || null };
        dispatch(setUser(payload));
        setLocalUser(payload);
      } else {
        dispatch(clearUser());
        setLocalUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [dispatch]);

  const value = useMemo(() => ({ user, loading }), [user, loading]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuthCtx() { return useContext(AuthCtx); }
// src/context/AuthProvider.jsx