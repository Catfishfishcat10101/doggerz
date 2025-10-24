// src/routes/AppRoutes.jsx
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

import { useAuthState } from "@/state/useAuthState"; // or your selector/context
import { useSelector } from "react-redux";
import { PATHS } from "@/routes/paths.js";

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-6 text-zinc-300">Booting…</div>}>
      <Routes>
        {/* Public section */}
        <Route element={<PublicLayout />}>
          {/* Smart index: if authed+onboarded → /game, if authed but not onboarded → /onboarding, else → /login */}
          <Route index element={<SmartIndex />} />
          <Route path={PATHS.LOGIN} element={<Login />} />
          <Route path={PATHS.SIGNUP} element={<Signup />} />
          <Route path={PATHS.PRIVACY} element={<Privacy />} />
          <Route path={PATHS.TERMS} element={<Terms />} />
        </Route>

        {/* Authenticated section */}
        <Route
          element={
            <ProtectedRoute requireEmailVerified={false}>
              <AuthedLayout />
            </ProtectedRoute>
          }
        >
          <Route path={PATHS.ONBOARDING} element={<Onboarding />} />

          <Route
            path={PATHS.GAME}
            element={
              <RequireOnboarding>
                <Game />
              </RequireOnboarding>
            }
          />

          <Route path={PATHS.HOME} element={<Home />} />
          <Route path={PATHS.PROFILE} element={<Profile />} />
        </Route>

        {/* 404 */}
        <Route path={PATHS.NOT_FOUND} element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

/* ---------- helpers ---------- */

function SmartIndex() {
  // swap these to your actual auth/dog/onboarding sources
  const user = useSelector((s) => s.auth?.user);
  const dog = useSelector((s) => s.dog);
  const isOnboarded = !!dog?.id;

  if (!user) return <Navigate to={PATHS.LOGIN} replace />;
  if (!isOnboarded) return <Navigate to={PATHS.ONBOARDING} replace />;
  return <Navigate to={PATHS.GAME} replace />;
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
