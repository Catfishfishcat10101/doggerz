// src/AppRouter.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// Lazy-load route pages to reduce initial bundle size. Add additional
// routes here as pages are added. Keep route paths simple and stable.
const Landing = lazy(() => import("./pages/Landing.jsx"));
const AdoptPage = lazy(() => import("./pages/Adopt.jsx"));
const GamePage = lazy(() => import("./pages/GamePage.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));
const About = lazy(() => import("./pages/About.jsx"));
const Help = lazy(() => import("./pages/Help.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

export default function AppRouter() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: 20, textAlign: "center" }}>Loading…</div>
      }
    >
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/adopt" element={<AdoptPage />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/help" element={<Help />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
