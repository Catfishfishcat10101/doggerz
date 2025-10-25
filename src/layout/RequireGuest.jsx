import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Placeholder guest check
const isAuthenticated = false;

export default function RequireGuest() {
  return isAuthenticated ? <Navigate to="/game" /> : <Outlet />;
}
