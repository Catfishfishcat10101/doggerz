import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { selectUser } from "@/redux/userSlice";

/**
 * Guest-only guard:
 * - If NOT signed in => render children/Outlet (e.g., Login, Signup)
 * - If signed in     => redirect to app home (default: /game)
 */
export default function RequireGuest({ to = "/game", children }) {
  const user = useSelector(selectUser);
  const location = useLocation();
  if (user) {
    // If URL had a ?next=, honor it; otherwise go to "to"
    const params = new URLSearchParams(location.search);
    const next = params.get("next");
    return <Navigate to={next || to} replace />;
  }
  return children ? children : <Outlet />;
}
