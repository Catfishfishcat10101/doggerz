// src/App.jsx
import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import RootLayout from "@/layout/RootLayout.jsx";
import RequireAuth from "@/layout/RequireAuth.jsx";
import RequireGuest from "@/layout/RequireGuest.jsx";

// Pages (eager or lazy – your call)
import Home from "@/pages/Home.jsx";
import Login from "@/pages/auth/Login.jsx";
import Signup from "@/pages/auth/Signup.jsx";
import Game from "@/pages/Game.jsx";
import Shop from "@/pages/Shop.jsx";
import Settings from "@/pages/Settings.jsx";

export default function App() {
  return (
    <Suspense fallback={<div className="p-6 text-zinc-300">Booting…</div>}>
      <Routes>
        <Route element={<RootLayout />}>
          {/* Public routes */}
          <Route index element={<Home />} />

          <Route element={<RequireGuest.Outlet />}>
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
          </Route>

          {/* Protected routes */}
          <Route element={<RequireAuth.Outlet />}>
            <Route path="game" element={<Game />} />
            <Route path="shop" element={<Shop />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Fallbacks */}
          <Route path="404" element={<div className="p-6">Not found.</div>} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
