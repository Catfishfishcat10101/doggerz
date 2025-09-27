import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";

const Splash       = lazy(() => import("@/components/UI/Splash.jsx"));
const GameScreen   = lazy(() => import("@/components/UI/GameScreen.jsx"));
const Login        = lazy(() => import("@/components/Auth/Login.jsx"));
const Signup       = lazy(() => import("@/components/Auth/Signup.jsx"));
// add more lazy routes as needed…

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col">
      <NavBar /> {/* This is now INSIDE the Router context */}
      <main className="flex-1">
        <Suspense fallback={<div className="p-6">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/play" element={<GameScreen />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}
