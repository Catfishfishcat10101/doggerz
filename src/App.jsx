// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Layout shells & guards
import RootLayout from "@/layout/RootLayout.jsx";
import PublicLayout from "@/layout/PublicLayout.jsx";
import AuthedLayout from "@/layout/AuthedLayout.jsx";
import RequireAuth from "@/layout/RequireAuth.jsx";
import ErrorBoundary from "@/layout/ErrorBoundary.jsx";

/** Route-level code splitting (vibes: fast startup, lazy deep pages) */
const Home        = lazy(() => import("@/pages/Home.jsx"));
const Game        = lazy(() => import("@/pages/Game.jsx"));
const Shop        = lazy(() => import("@/pages/Shop.jsx"));
const Login       = lazy(() => import("@/pages/Login.jsx"));
const Signup      = lazy(() => import("@/pages/Signup.jsx"));
const Profile     = lazy(() => import("@/pages/Profile.jsx"));
const Settings    = lazy(() => import("@/pages/Settings.jsx"));
const NotFound    = lazy(() => import("@/pages/NotFound.jsx"));
const Terms       = lazy(() => import("@/pages/Legal/Terms.jsx"));
const Privacy     = lazy(() => import("@/pages/Legal/Privacy.jsx"));
const Onboarding  = lazy(() => import("@/pages/Onboarding.jsx"));

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="p-6 text-white/80">
            Loading experience…
          </div>
        }
      >
        <Routes>
          {/* Global shell (NavBar + <Outlet/>) */}
          <Route element={<RootLayout />}>
            {/* Public area */}
            <Route element={<PublicLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="legal">
                <Route path="terms" element={<Terms />} />
                <Route path="privacy" element={<Privacy />} />
              </Route>
            </Route>

            {/* Authenticated app area */}
            <Route
              element={
                <RequireAuth>
                  <AuthedLayout />
                </RequireAuth>
              }
            >
              <Route path="game" element={<Game />} />
              <Route path="shop" element={<Shop />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* 404s and safety nets */}
            <Route path="404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
