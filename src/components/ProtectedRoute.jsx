// @ts-nocheck
// src/components/ProtectedRoute.jsx

import React from "react";
import PropTypes from "prop-types";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";

/**
 * ProtectedRoute:
 *   - Wrap any route that requires auth
 *   - Redirects to /login if user is not authenticated
 *
 * Usage:
 * <Route path="/game" element={<ProtectedRoute><GamePage /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children }) {
  const user = useSelector(selectUser);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
};
