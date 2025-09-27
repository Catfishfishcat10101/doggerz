import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Use your actual file paths (match your tree in the screenshots)
const Splash     = lazy(() => import("@/pages/Splash.jsx"));
const Auth       = lazy(() => import("@/pages/Auth.jsx"));
const GameScreen = lazy(() => import("@/components/UI/GameScreen.jsx"));
const NewPup     = lazy(() => import("@/components/Setup/NewPup.jsx"));

import ProtectedRoute from "@/routes/ProtectedRoute.jsx";

const Fallback = () => <div className="p-6 text-center">Loading…</div>;

export default function AppRoutes() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/setup" element={<ProtectedRoute><NewPup /></ProtectedRoute>} />
        <Route path="/game" element={<ProtectedRoute><GameScreen /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}