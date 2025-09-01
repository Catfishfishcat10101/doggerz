import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="p-8">Checking auth…</div>;
  if (!user) return <Navigate to="/auth" replace state={{ from: location }} />;

  return <Outlet />;
}
