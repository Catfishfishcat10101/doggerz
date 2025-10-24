// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import RootLayout from "@/layout/RootLayout.jsx";
import RequireAuth from "@/layout/RequireAuth.jsx";
import RequireGuest from "@/layout/RequireGuest.jsx";
import RequireOnboarding from "@/routes/RequireOnboarding.jsx";

const Home = lazy(() => import("@/pages/Home.jsx"));
const Game = lazy(() => import("@/pages/Game.jsx"));
const Shop = lazy(() => import("@/pages/Shop.jsx"));
const Settings = lazy(() => import("@/pages/Settings.jsx"));
const Login = lazy(() => import("@/pages/Login.jsx"));
const Signup = lazy(() => import("@/pages/Signup.jsx"));
const Onboarding = lazy(() => import("@/pages/Onboarding.jsx"));
const Privacy = lazy(() => import("@/pages/Legal/Privacy.jsx"));
const Terms = lazy(() => import("@/pages/Legal/Terms.jsx"));
const NotFound = lazy(() => import("@/pages/NotFound.jsx"));

export default function App() {
  return (
    <Suspense fallback={<div className="p-6 text-white">Loading…</div>}>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />

          <Route element={<RequireGuest />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          <Route element={<RequireAuth />}>
            <Route path="/game" element={<Game />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route element={<RequireOnboarding />}>
            <Route path="/onboarding" element={<Onboarding />} />
          </Route>

          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
// src/App.jsx