// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Shared shell + route guards
import RootLayout from "@/layout/RootLayout.jsx";
import RequireAuth from "@/layout/RequireAuth.jsx";
import RequireGuest from "@/layout/RequireGuest.jsx";
import RequireOnboarding from "@/routes/RequireOnboarding.jsx";

// Lazy pages (faster TTI; swap to eager imports if you prefer)
const Home        = lazy(() => import("@/pages/Home.jsx"));
const Login       = lazy(() => import("@/pages/auth/Login.jsx"));
const Signup      = lazy(() => import("@/pages/auth/Signup.jsx"));
const Game        = lazy(() => import("@/pages/Game.jsx"));
const Shop        = lazy(() => import("@/pages/Shop.jsx"));
const Settings    = lazy(() => import("@/pages/Settings.jsx"));
const Onboarding  = lazy(() => import("@/pages/Onboarding.jsx"));
const Privacy     = lazy(() =>
  import("@/pages/Legal/Privacy.jsx").catch(() => ({ default: () => <div className="p-6">Privacy</div> }))
);
const Terms       = lazy(() =>
  import("@/pages/Legal/Terms.jsx").catch(() => ({ default: () => <div className="p-6">Terms</div> }))
);

// Minimal 404 (use your NotFound.jsx if you have one)
function NotFound() {
  return <div className="p-6">Not found.</div>;
}

function BootFallback() {
  return (
    <div className="p-6 text-zinc-300">
      Booting…
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<BootFallback />}>
      <Routes>
        {/* Shared app chrome (header/nav/footer/scroll restore) */}
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route index element={<Home />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />

          {/* Guest-only (redirects authed users away) */}
          <Route element={<RequireGuest />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>

          {/* Auth-required */}
          <Route element={<RequireAuth />}>
            {/* Onboarding is only for authed users; guard sends here when name/stage missing */}
            <Route path="onboarding" element={<Onboarding />} />

            {/* Game gated behind onboarding completeness */}
            <Route
              path="game"
              element={
                <RequireOnboarding>
                  <Game />
                </RequireOnboarding>
              }
            />

            {/* Other authed pages */}
            <Route path="shop" element={<Shop />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Legacy/cleanup routes */}
          <Route path="new-pup" element={<Navigate to="/game" replace />} />

          {/* 404 */}
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
