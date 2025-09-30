import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";
import InstallPrompt from "@/components/UI/InstallPrompt.jsx";
import AuthGate from "@/components/Auth/AuthGate.jsx";

const Splash     = lazy(() => import("@/components/UI/Splash.jsx"));
const GameScreen = lazy(() => import("@/components/UI/GameScreen.jsx"));
const Shop       = lazy(() => import("@/components/Features/Shop.jsx"));
const Settings   = lazy(() => import("@/components/UI/Settings.jsx")); // fix missing file

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-neutral-950 text-neutral-100">
      <NavBar />
      <Suspense fallback={<div className="p-6 opacity-70">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Splash />} />

          <Route
            path="/game"
            element={
              <AuthGate>
                <GameScreen />
              </AuthGate>
            }
          />

          <Route
            path="/shop"
            element={
              <AuthGate>
                <Shop />
              </AuthGate>
            }
          />

          <Route
            path="/settings"
            element={
              <AuthGate>
                <Settings />
              </AuthGate>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <InstallPrompt />
    </div>
  );
}