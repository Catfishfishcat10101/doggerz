// src/AppShell.jsx
// @ts-nocheck

import React, { Suspense, lazy } from "react";
import { cssVars } from "@/constants/palette.js";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import AppHeader from "@/features/game/components/AppHeader.jsx";
import AppFooter from "@/features/game/components/AppFooter.jsx";
import ProtectedRoute from "@/features/game/components/ProtectedRoute.jsx";
import ToastProvider from "@/components/ToastProvider.jsx";
import CloudSyncNotice from "@/components/CloudSyncNotice.jsx";
import ContributePage from "@/pages/Contribute";

// Lazy-loaded pages
const Splash = lazy(() => import("@/pages/Splash.jsx"));
const Landing = lazy(() => import("@/pages/Landing.jsx"));
const Adopt = lazy(() => import("@/pages/Adopt.jsx"));
const GamePage = lazy(() => import("@/pages/Game.jsx"));
const Login = lazy(() => import("@/pages/Login.jsx"));
const Signup = lazy(() => import("@/pages/Signup.jsx"));
const About = lazy(() => import("@/pages/About.jsx"));
const Settings = lazy(() => import("@/pages/Settings.jsx"));
const Legal = lazy(() => import("@/pages/Legal.jsx"));
const NotFound = lazy(() => import("@/pages/NotFound.jsx"));
const Memory = lazy(() => import("@/pages/Memory.jsx"));
const Potty = lazy(() => import("@/pages/Potty.jsx"));
const Contact = lazy(() => import("@/pages/Contact.jsx"));

export default function AppShell() {
  const location = useLocation();

  // Prevent auto-activation: Only load protected routes if user navigates there
  // (React.lazy already prevents loading until navigation, but you can add extra guards if needed)

  return (
    <ToastProvider>
      <div className="app-shell flex flex-col min-h-screen">
        {/* Inject palette CSS variables for components to consume */}
        <style>{`:root{\n${cssVars()}\n}`}</style>
        {/* Skip to content link */}
        <a
          href="#app-main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-black shadow-lg"
        >
          Skip to main content
        </a>

        <AppHeader />
        <CloudSyncNotice />

        <main className="flex-1" id="app-main" aria-label="App main area">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-screen text-zinc-400">
                Loading...
              </div>
            }
          >
            <Routes location={location}>
              {/* Splash / hero */}
              <Route path="/" element={<Landing />} />
              <Route path="/splash" element={<Splash />} />

              {/* Public flows */}
              <Route path="/adopt" element={<Adopt />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected game routes (only loaded if navigated) */}
              <Route
                path="/game"
                element={
                  location.pathname === "/game" ? (
                    <ProtectedRoute>
                      <GamePage />
                    </ProtectedRoute>
                  ) : null
                }
              />
              <Route
                path="/potty"
                element={
                  location.pathname === "/potty" ? (
                    <ProtectedRoute>
                      <Potty />
                    </ProtectedRoute>
                  ) : null
                }
              />

              <>
                {/* existing routes… */}
                <Route path="/contribute" element={<ContributePage />} />
                {/* 404 catch-all */}
                {/* <Route path="*" element={<NotFoundPage />} /> */}
              </>

              {/* Extra pages */}
              <Route path="/about" element={<About />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/legal" element={<Legal />} />
              <Route path="/memory" element={<Memory />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/play" element={<Navigate to="/game" replace />} />

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <AppFooter />
      </div>
    </ToastProvider>
  );
}
