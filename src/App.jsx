import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

const Splash = lazy(() => import("./components/UI/Splash.jsx"));
const AuthPage = lazy(() => import("./pages/Auth.jsx"));
const GameScreen = lazy(() => import("./components/UI/GameScreen.jsx"));

export default function App() {
  return (
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
  );
}
