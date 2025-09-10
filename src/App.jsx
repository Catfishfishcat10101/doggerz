// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

const Splash = lazy(() => import("./components/UI/Splash"));
const GameScreen = lazy(() => import("./components/UI/GameScreen"));
const PottyTrainer = lazy(() => import("./components/Features/PottyTrainer"));
const TricksTrainer = lazy(() => import("./components/Features/TricksTrainer"));
const StatsPanel = lazy(() => import("./components/Features/StatsPanel"));
const Login = lazy(() => import("./components/Auth/Login"));
const Signup = lazy(() => import("./components/Auth/Signup"));

export default function App() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/train/potty" element={<PottyTrainer />} />
        <Route path="/train/tricks" element={<TricksTrainer />} />
        <Route path="/stats" element={<StatsPanel />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
