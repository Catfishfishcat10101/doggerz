import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Lazy route chunks (code-splitting)
const Splash        = lazy(() => import("@/components/UI/Splash.jsx"));
const GameScreen    = lazy(() => import("@/components/UI/GameScreen.jsx"));
const PottyTrainer  = lazy(() => import("@/components/Features/PottyTrainer.jsx"));
const TricksTrainer = lazy(() => import("@/components/Features/TricksTrainer.jsx"));
const StatsPanel    = lazy(() => import("@/components/Features/StatsPanel.jsx"));
const Shop          = lazy(() => import("@/components/Features/Shop.jsx"));
const Breeding      = lazy(() => import("@/components/Features/Breeding.jsx"));
const Accessories   = lazy(() => import("@/components/Features/Accessories.jsx"));
const Login         = lazy(() => import("@/components/Auth/Login.jsx"));
const Signup        = lazy(() => import("@/components/Auth/Signup.jsx"));

// Optional: simple page shell/header could be added here if you want global nav

export default function App() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading…</div>}>
      <Routes>
        {/* Landing */}
        <Route path="/" element={<Splash />} />

        {/* Core game */}
        <Route path="/game" element={<GameScreen />} />

        {/* Trainers */}
        <Route path="/train/potty" element={<PottyTrainer />} />
        <Route path="/train/tricks" element={<TricksTrainer />} />

        {/* Meta / economy */}
        <Route path="/stats" element={<StatsPanel />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/accessories" element={<Accessories />} />
        <Route path="/breed" element={<Breeding />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
