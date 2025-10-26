import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Placeholder auth check
const isAuthenticated = true;

export default function RequireAuth() {
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
}
