// src/components/ProtectedRoute.jsx
// Simple auth gate for routes like /game, /potty, etc.

import * as React from "react";
import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsLoggedIn } from "@/redux/userSlice.js";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const location = useLocation();

  // If no user is logged in, boot them to /login and remember where they tried to go
  if (!isLoggedIn) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname || "/" }}
      />
    );
  }

  // User is logged in → allow access
  return children;
}
