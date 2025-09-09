// src/context/AuthProvider.jsx
import React, { createContext, useContext } from "react";

const AuthContext = createContext({ user: null });
export const useAuth = () => useContext(AuthContext);

// Simple pass-through for now; swap in Firebase later.
export default function AuthProvider({ children }) {
  const value = { user: null };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}