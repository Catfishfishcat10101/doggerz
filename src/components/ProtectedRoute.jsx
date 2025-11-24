// src/components/ProtectedRoute.jsx
// Simple auth gate for routes like /game, /potty, etc.

import { useSelector } from "react-redux";
import { Navigate, useLocation } from "react-router-dom";
import { selectUser } from "@/redux/userSlice.js"; // adjust if your selector name is different

export default function ProtectedRoute({ children }) {
  const user = useSelector(selectUser);
  const location = useLocation();

  // If no user is logged in, boot them to /login and remember where they tried to go
  if (!user) {
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
