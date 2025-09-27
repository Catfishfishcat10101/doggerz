import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";

const Splash     = lazy(() => import("@/components/UI/Splash.jsx"));
const GameScreen = lazy(() => import("@/components/UI/GameScreen.jsx")); // keep your file if it exists
const Shop       = lazy(() => import("@/components/Features/Shop.jsx")); // optional route

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <NavBar />
      <Suspense fallback={<div className="p-6 opacity-70">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}