// src/App.jsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import RootLayout from "./layout/RootLayout.jsx";
import RequireAuth from "./layout/RequireAuth.jsx";
import RequireGuest from "./layout/RequireGuest.jsx";

/* ----------------------------- UX helpers ----------------------------- */

function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center text-sm text-zinc-400">
      Loading…
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

/* ------------------------------- Pages -------------------------------- */

const Splash = lazy(() => import("./pages/Splash.jsx"));
const Login = lazy(() => import("./pages/Login.jsx"));
const Adopt = lazy(() => import("./pages/Adopt.jsx"));
const Game = lazy(() => import("./pages/Game.jsx"));

const Shop = lazy(() => import("./pages/Shop.jsx"));
const Memory = lazy(() => import("./pages/Memory.jsx"));
const Potty = lazy(() => import("./pages/Potty.jsx"));
const Upgrade = lazy(() => import("./pages/Upgrade.jsx"));

/* ------------------------------ Not Found ----------------------------- */

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-bold">404</h1>
      <p className="text-sm text-zinc-400">
        This route doesn’t exist.{" "}
        <a href="/" className="underline text-sky-400">
          Go back home
        </a>
        .
      </p>
    </div>
  );
}

/* -------------------------------- App --------------------------------- */

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<RootLayout />}>
            {/* Public splash */}
            <Route index element={<Splash />} />

            {/* Auth / login */}
            <Route
              path="login"
              element={
                <RequireGuest>
                  <Login />
                </RequireGuest>
              }
            />

            {/* Auth-gated core screens */}
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

            {/* Optional feature pages */}
            <Route
              path="shop"
              element={
                <RequireAuth>
                  <Shop />
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

            {/* Legacy redirects */}
            <Route path="home" element={<Navigate to="/" replace />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}