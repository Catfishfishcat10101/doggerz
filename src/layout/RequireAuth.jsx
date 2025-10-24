// src/layout/RequireAuth.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation, Outlet } from "react-router-dom";
import { selectUser } from "@/redux/userSlice";

/**
 * Route guard:
 * - If user exists -> render children/Outlet
 * - If not -> bounce to /login and remember where they were going
 *
 * Usage:
 *   <Route element={<RequireAuth />}>
 *     <Route path="/game" element={<Game />} />
 *   </Route>
 */
export default function RequireAuth({ children }) {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Support both nested routes (Outlet) and direct children.
  return children ? children : <Outlet />;
}
