// src/layout/RequireAuth.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthCtx } from "@/context/AuthProvider";
export default function RequireAuth({ children }) {
  const { isAuthed, loading } = useAuthCtx();
  const loc = useLocation();
  if (loading) return <div style={{ padding: 24 }}>Checking session…</div>;
  return isAuthed ? children : <Navigate to="/login" replace state={{ from: loc }} />;
}
