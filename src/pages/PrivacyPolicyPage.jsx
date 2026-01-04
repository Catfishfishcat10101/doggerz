/** @format */

// src/pages/PrivacyPolicyPage.jsx
// This file existed as an accidental duplicate of `src/main.jsx`.
// Keep it as a harmless redirect so any stray imports/deep-links land on the
// canonical in-app privacy policy page.

import { Navigate } from "react-router-dom";

export default function PrivacyPolicyPage() {
  return <Navigate to="/privacy" replace />;
}
