import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@routes/ProtectedRoute";
import AuthProvider from "@context/AuthProvider";

const Splash = lazy(() => import("@components/UI/Splash"));
const AuthPage = lazy(() => import("@pages/Auth"));
const GameScreen = lazy(() => import("@components/UI/GameScreen"));

export default function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="p-8">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/game" element={<GameScreen />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}