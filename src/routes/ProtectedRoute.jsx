import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return <div className="p-8">Loading…</div>;
  return user ? <Outlet /> : <Navigate to="/auth" replace state={{ from: loc }} />;
}
