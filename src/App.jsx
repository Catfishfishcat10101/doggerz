// src/App.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Use existing files you actually have
const Splash = lazy(() => import("./components/UI/Splash.jsx"));
const GameScreen = lazy(() => import("./components/UI/GameScreen.jsx"));
const AuthPage = lazy(() => import("./pages/Auth.jsx")); // see stub below

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="p-8">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}