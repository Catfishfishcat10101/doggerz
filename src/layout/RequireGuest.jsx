// src/layout/RequireGuest.jsx
import { Navigate } from "react-router-dom";
import { useAuthCtx } from "@/context/AuthProvider";
export default function RequireGuest({ children }) {
  const { isAuthed, loading } = useAuthCtx();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  return isAuthed ? <Navigate to="/game" replace /> : children;
}
