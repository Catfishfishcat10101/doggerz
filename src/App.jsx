// src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import RootLayout from "./layout/RootLayout";
import RequireAuth from "./layout/RequireAuth";
import RequireGuest from "./layout/RequireGuest";

/* ----------------------------- UX helpers ----------------------------- */
function PageLoader() {
  return (
    <div className="min-h-dvh grid place-items-center bg-[#0b1020] text-white">
      <div className="animate-pulse text-white/70">Loading…</div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* ----------------------------- Safe lazy() ---------------------------- */
/** Lazy import a page; if the file doesn’t exist, render a placeholder. */
function lazySafe(path, title) {
  return lazy(async () => {
    try {
      // Vite will resolve this at build time; if missing, we fall back.
      return await import(/* @vite-ignore */ path);
    } catch {
      return {
        default: () => (
          <div className="min-h-dvh grid place-items-center bg-[#0b1020] text-white">
            <div className="text-center">
              <h1 className="text-3xl font-bold">{title}</h1>
              <p className="mt-2 text-white/70">
                This screen isn’t implemented yet. Ship it next sprint.
              </p>
            </div>
          </div>
        ),
      };
    }
  });
}

/* ------------------------------- Pages -------------------------------- */
// Core
const Splash = lazySafe("./pages/Splash.jsx", "Doggerz");
const Login = lazySafe("./pages/Login.jsx", "Login");
const Adopt = lazySafe("./pages/Adopt.jsx", "Adopt");
const Game = lazySafe("./pages/Game.jsx", "Game");

// Optional pages referenced by your UI (Quick Links / Shop)
const Shop = lazySafe("./pages/Shop.jsx", "Shop");
const Affection = lazySafe("./pages/Affection.jsx", "Affection");
const Memory = lazySafe("./pages/Memory.jsx", "Memories");
const Potty = lazySafe("./pages/Potty.jsx", "Potty Training");
const Upgrade = lazySafe("./pages/Upgrade.jsx", "Yard Upgrades");

/* ------------------------------ Not Found ----------------------------- */
function NotFound() {
  return (
    <div className="min-h-dvh grid place-items-center bg-[#0b1020] text-white">
      <div className="text-center">
        <h1 className="text-3xl font-bold">404</h1>
        <p className="mt-2 text-white/70">This route doesn’t exist.</p>
      </div>
    </div>
  );
}

/* -------------------------------- App --------------------------------- */
export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public */}
          <Route index element={<Splash />} />
          <Route
            path="login"
            element={
              <RequireGuest>
                <Login />
              </RequireGuest>
            }
          />

          {/* Auth-gated */}
          <Route
            path="adopt"
            element={
              <RequireAuth>
                <Adopt />
              </RequireAuth>
            }
          />
          <Route
            path="game"
            element={
              <RequireAuth>
                <Game />
              </RequireAuth>
            }
          />

          {/* Nice-to-haves (guarded) */}
          <Route
            path="shop"
            element={
              <RequireAuth>
                <Shop />
              </RequireAuth>
            }
          />
          <Route
            path="affection"
            element={
              <RequireAuth>
                <Affection />
              </RequireAuth>
            }
          />
          <Route
            path="memory"
            element={
              <RequireAuth>
                <Memory />
              </RequireAuth>
            }
          />
          <Route
            path="potty"
            element={
              <RequireAuth>
                <Potty />
              </RequireAuth>
            }
          />
          <Route
            path="upgrade"
            element={
              <RequireAuth>
                <Upgrade />
              </RequireAuth>
            }
          />

          {/* Fallbacks */}
          <Route path="*" element={<NotFound />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
export default App;