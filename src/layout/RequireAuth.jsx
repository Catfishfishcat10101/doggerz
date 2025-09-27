// src/layout/RequireAuth.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectUser } from "@/redux/userSlice";

export default function RequireAuth({ children }) {
  const user = useSelector(selectUser);
  const loc = useLocation();

  if (!user?.uid) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }
  return children;
}
