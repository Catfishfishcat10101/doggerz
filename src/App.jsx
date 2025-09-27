// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";

const Splash     = lazy(() => import("@/components/UI/Splash.jsx"));
const GameScreen = lazy(() => import("@/components/UI/GameScreen.jsx"));
const Shop       = lazy(() => import("@/components/Features/Shop.jsx"));
const Login      = lazy(() => import("@/components/Auth/Login.jsx"));
const Signup     = lazy(() => import("@/components/Auth/Signup.jsx"));

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-neutral-950 text-white">
      <NavBar />
      <Suspense fallback={<div className="p-6 opacity-70">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}