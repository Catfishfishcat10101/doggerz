import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthCtx } from "@context/AuthProvider";

export default function ProtectedRoute() {
  const { user, loading } = useAuthCtx();
  const loc = useLocation();
  if (loading) return <div className="p-8">Checking session…</div>;
  if (!user) return <Navigate to="/auth" replace state={{ from: loc }} />;
  return <Outlet />;
}