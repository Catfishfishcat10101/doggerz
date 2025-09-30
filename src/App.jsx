// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import NavBar from "@/components/UI/NavBar.jsx";
import { selectUser } from "@/redux/userSlice";

// Lazy routes (ensure these files exist and default-export components)
const Splash     = lazy(() => import("@/components/UI/Splash.jsx"));
const GameScreen = lazy(() => import("@/components/UI/GameScreen.jsx"));
const Shop       = lazy(() => import("@/components/Features/Shop.jsx"));
const Login      = lazy(() => import("@/components/Auth/Login.jsx"));
const Signup     = lazy(() => import("@/components/Auth/Signup.jsx"));

// Auth gate that preserves the 'from' route for a smooth bounce-back
function RequireAuth({ children }) {
  const user = useSelector(selectUser);
  const location = useLocation();
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-zinc-950 text-zinc-100">
      <NavBar />
      <Suspense fallback={<div className="p-6 opacity-70">Loading…</div>}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Authenticated only */}
          <Route
            path="/game"
            element={
              <RequireAuth>
                <GameScreen />
              </RequireAuth>
            }
          />
          <Route
            path="/shop"
            element={
              <RequireAuth>
                <Shop />
              </RequireAuth>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}