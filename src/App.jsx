// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import NavBar from "@/components/UI/NavBar.jsx";
import { selectUser } from "@/redux/userSlice";

// Inline guard (no common/ folder needed)
function ProtectedRoute({ children }) {
  const user = useSelector(selectUser);
  const loc = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: loc }} />;
  return children;
}

const Splash     = lazy(() => import("@/components/UI/Splash.jsx"));
const GameScreen = lazy(() => import("@/components/UI/GameScreen.jsx"));
const Login      = lazy(() => import("@/components/Auth/Login.jsx"));
const Signup     = lazy(() => import("@/components/Auth/Signup.jsx"));

export default function App() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-slate-100">
      <NavBar />
      <Suspense fallback={<div className="p-6 opacity-70">Loading…</div>}>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/game"
            element={
              <ProtectedRoute>
                <GameScreen />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
