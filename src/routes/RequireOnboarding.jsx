import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

// Adjust these selectors to your profile slice if different
const selectProfile = (s) => s.profile?.data || { name: null, stage: null };
const isComplete = (p) => Boolean(p?.name) && Boolean(p?.stage);

export default function RequireOnboarding({ children }) {
  const profile = useSelector(selectProfile);

  if (!isComplete(profile)) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
