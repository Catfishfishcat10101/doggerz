// src/layout/RequireAuth.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectUser } from "@/redux/userSlice";

export default function RequireAuth({ children }) {
  const user = useSelector(selectUser);
  const location = useLocation();

  if (!user?.uid) {
    // Preserve where the user was headed, as a string the rest of the app can read
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  return <>{children}</>;
}
