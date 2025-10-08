// src/routes/RequireOnboarding.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectDog } from "@/redux/dogSlice";

export default function RequireOnboarding({ children }) {
  const loc = useLocation();
  const dog = useSelector(selectDog);
  const hasName  = !!dog?.name && dog.name.trim().length >= 2;
  const hasStage = !!dog?.stage;
  if (!hasName || !hasStage) {
    return <Navigate to="/onboarding" replace state={{ from: loc }} />;
    // Optionally: if user not authed, bounce to /login first; then let login redirect here.
  }
  return children;
}
