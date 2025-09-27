import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/UI/NavBar.jsx";
import InstallPrompt from "./components/UI/InstallPrompt.jsx";
import Splash from "./components/UI/Splash.jsx";
import GameScreen from "./components/UI/GameScreen.jsx";
import Shop from "./components/Features/Shop.jsx";

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-zinc-900 text-zinc-50">
      <div className="p-2 text-xs opacity-60">App mounted ✅</div>
      <NavBar />
      <Suspense fallback={<div className="p-6 opacity-70">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      <InstallPrompt />
    </div>
  );
}