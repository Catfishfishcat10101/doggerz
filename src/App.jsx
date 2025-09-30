<<<<<<< Updated upstream
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";
import InstallPrompt from "@/components/UI/InstallPrompt.jsx";
import Footer from "@/components/UI/Footer.jsx";
import AuthGate from "@/components/Auth/AuthGate.jsx";

const Splash     = lazy(() => import("@/components/UI/Splash.jsx"));
const GameScreen = lazy(() => import("@/components/UI/GameScreen.jsx"));
const Shop       = lazy(() => import("@/components/Features/Shop.jsx"));
<<<<<<< HEAD
const Settings   = lazy(() => import("@/components/UI/Settings.jsx"));
=======
const Settings   = lazy(() => import("@/components/UI/Settings.jsx")); // fix missing file
=======
import React, { Suspense, lazy, useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import NavBar from "@/components/UI/NavBar.jsx";
import InstallPrompt from "@/components/UI/InstallPrompt.jsx";
>>>>>>> 39f5936e (Resolve merge conflicts in main.jsx and offline.html)

// Lazy-loaded screens (code-split)
const Splash     = lazy(() => import("@/components/UI/Splash.jsx"));
const NewPup     = lazy(() => import("@/components/UI/NewPup.jsx"));
const GameScreen = lazy(() => import("@/components/UI/GameScreen.jsx"));
const Shop       = lazy(() => import("@/components/Features/Shop.jsx"));
const Auth       = lazy(() => import("@/components/Auth/AuthGate.jsx")); // optional; create if you have it
const Settings   = lazy(() => import("@/components/UI/Settings.jsx"));   // optional; create if you have it
>>>>>>> Stashed changes

/** Simple, high-contrast skeleton to avoid retina-searing flash */
function LoadingFallback() {
  return (
<<<<<<< Updated upstream
    <div className="min-h-dvh flex flex-col bg-neutral-950 text-neutral-100">
      <NavBar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-6 opacity-70">Loading…</div>}>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route
              path="/game"
              element={
                <AuthGate>
                  <GameScreen />
                </AuthGate>
              }
            />
            <Route
              path="/shop"
              element={
                <AuthGate>
                  <Shop />
                </AuthGate>
              }
            />
            <Route
              path="/settings"
              element={
                <AuthGate>
                  <Settings />
                </AuthGate>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      <InstallPrompt />
      <Footer />
    </div>
  );
=======
    <div className="min-h-dvh grid place-items-center bg-zinc-950 text-zinc-200">
      <div className="animate-pulse rounded-2xl border border-zinc-800 px-6 py-4">
        Loading…
      </div>
    </div>
  );
}

/** Scroll to top on route change (no surprises) */
function ScrollRestorer() {
  const { pathname } = useLocation();
  useEffect(() => {
    // Don't steal focus from users who just interacted with something
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

/** Move keyboard focus to the main region on route change (a11y win) */
function RouteFocus() {
  const { pathname } = useLocation();
  const ref = useRef(null);
  useEffect(() => {
    // Wait one tick for the page to render before focusing
    const id = setTimeout(() => ref.current?.focus(), 0);
    return () => clearTimeout(id);
  }, [pathname]);
  return <div ref={ref} tabIndex={-1} aria-hidden="true" />;
}

/** Gate that requires a pup name in localStorage before entering /game */
function RequirePupName({ children }) {
  let hasName = false;
  try {
    const v = localStorage.getItem("dogName");
    hasName = !!(v && v.trim().length >= 2);
  } catch {
    hasName = false;
  }
  if (!hasName) return <Navigate to="/new-pup" replace />;
  return children;
}

export default function App() {
  return (
    <div className="min-h-dvh flex flex-col bg-zinc-950 text-zinc-100">
      <NavBar />
      <InstallPrompt />
      <ScrollRestorer />
      <RouteFocus />

      <main id="main" className="flex-1">
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Marketing / landing */}
            <Route path="/" element={<Splash />} />

            {/* Auth (optional route; safe to remove if unused) */}
            <Route path="/auth" element={<Auth />} />

            {/* Pup naming gate */}
            <Route path="/new-pup" element={<NewPup />} />

            {/* Core game route, protected by pup-name presence */}
            <Route
              path="/game"
              element={
                <RequirePupName>
                  <GameScreen />
                </RequirePupName>
              }
            />

            {/* Storefront */}
            <Route path="/shop" element={<Shop />} />

            {/* Settings (optional) */}
            <Route path="/settings" element={<Settings />} />

            {/* 404 → send new users to naming flow first */}
            <Route path="*" element={<Navigate to="/new-pup" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
>>>>>>> Stashed changes
}