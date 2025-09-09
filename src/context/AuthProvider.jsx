// src/context/AuthProvider.jsx
import React, { createContext, useContext, useState, useMemo } from "react";

const AuthContext = createContext({ user: null, loading: false });
export const useAuth = () => useContext(AuthContext);

// Named export
export function AuthProvider({ children }) {
  // Stubbed auth; swap in Firebase later
  const [user] = useState(null);
  const value = useMemo(() => ({ user, loading: false }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Default export too (so either import style works)
export default AuthProvider;