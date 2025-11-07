import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "@/layout/RequireAuth.jsx";
import RequireGuest from "@/layout/RequireGuest.jsx";
import RootLayout from "@/layout/RootLayout.jsx"; // header/footer; or replace with a fragment
import { GameScreen } from "@/features/game";     // feature barrel

// Code-split the light pages
const Home   = lazy(() => import("@/pages/Home.jsx"));
const Login  = lazy(() => import("@/pages/Login.jsx"));
const Signup = lazy(() => import("@/pages/Signup.jsx"));
const NotFound = lazy(() => import("@/pages/NotFound.jsx")); // optional

export default function App() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Landing */}
          <Route index element={<Home />} />

          {/* Auth-only route */}
          <Route
            path="/game"
            element={
              <RequireAuth>
                <GameScreen />
              </RequireAuth>
            }
          />

          {/* Guests only */}
          <Route
            path="/login"
            element={
              <RequireGuest>
                <Login />
              </RequireGuest>
            }
          />
          <Route
            path="/signup"
            element={
              <RequireGuest>
                <Signup />
              </RequireGuest>
            }
          />

          {/* Utility redirects */}
          <Route path="/play" element={<Navigate to="/game" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
