// src/AppRoutes.jsx
import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import PublicLayout from "@/layout/PublicLayout.jsx";
import AuthedLayout from "@/layout/AuthedLayout.jsx";
import ProtectedRoute from "@/routes/ProtectedRoute.jsx";
import RequireOnboarding from "@/routes/RequireOnboarding.jsx";

import Home from "@/pages/Home.jsx";
import Game from "@/pages/Game.jsx";
import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx";
import Profile from "@/pages/Profile.jsx";
import Onboarding from "@/pages/Onboarding.jsx";

import Privacy from "@/components/Legal/Privacy.jsx";
import Terms from "@/components/Legal/Terms.jsx";

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-6 text-zinc-300">Booting…</div>}>
      <Routes>
        {/* Public section */}
        <Route element={<PublicLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>

        {/* Authenticated section */}
        <Route
          element={
            <ProtectedRoute requireEmailVerified={false}>
              <AuthedLayout />
            </ProtectedRoute>
          }
        >
          {/* Onboarding route for first-time authed users */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Game gated behind onboarding completeness */}
          <Route
            path="/game"
            element={
              <RequireOnboarding>
                <Game />
              </RequireOnboarding>
            }
          />

          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function NotFound() {
  const loc = useLocation();
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">404</h1>
      <p className="opacity-70">No route: {loc.pathname}</p>
    </div>
  );
}
