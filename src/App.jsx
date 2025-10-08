// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout + guards
import RootLayout from "@/layout/RootLayout.jsx";
import RequireAuth from "@/layout/RequireAuth.jsx";

// Lazy pages (ensure these files exist and default-export components)
const Splash     = lazy(() => import("@/components/UI/Splash.jsx"));
const GameScreen = lazy(() => import("@/components/UI/GameScreen.jsx"));
const Shop       = lazy(() => import("@/components/Features/Shop.jsx"));
const Login      = lazy(() => import("@/components/Auth/Login.jsx"));
const Signup     = lazy(() => import("@/components/Auth/Signup.jsx"));

function Fallback() {
  return (
    <div className="min-h-[50vh] grid place-items-center">
      <div className="animate-pulse rounded-2xl border border-white/15 px-6 py-4">
        Loading…
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<Fallback />}>
      <Routes>
        {/* All routes share RootLayout (NavBar, a11y helpers, boundary, etc.) */}
        <Route element={<RootLayout />}>
          {/* Public */}
          <Route index element={<Splash />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />

          {/* Protected app */}
          <Route
            path="game"
            element={
              <RequireAuth>
                <GameScreen />
              </RequireAuth>
            }
          />
          <Route
            path="shop"
            element={
              <RequireAuth>
                <Shop />
              </RequireAuth>
            }
          />

          {/* 404 → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
