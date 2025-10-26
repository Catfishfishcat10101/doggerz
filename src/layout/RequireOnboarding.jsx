// src/routes/RequireOnboarding.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { PATHS } from "@/routes/paths.js";

export default function RequireOnboarding({ children }) {
  const loc = useLocation();
  // Consider “onboarded” when a dog exists (adjust if your state differs)
  const hasDog = useSelector((s) => Boolean(s.dog?.id));

  // If no dog yet and we're not already on the onboarding page, redirect there
  if (!hasDog && loc.pathname !== PATHS.ONBOARDING) {
    return <Navigate to={PATHS.ONBOARDING} replace />;
  }

  // Optional: if they finished onboarding but are on /onboarding, bump them to /game
  if (hasDog && loc.pathname === PATHS.ONBOARDING) {
    return <Navigate to={PATHS.GAME} replace />;
  }

  return children;
}
