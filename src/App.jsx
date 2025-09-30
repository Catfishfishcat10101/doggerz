// src/App.jsx
import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import PublicLayout from "@/layout/PublicLayout.jsx";
import AuthedLayout from "@/layout/AuthedLayout.jsx";
import ProtectedRoute from "@/routes/ProtectedRoute.jsx";

import Home from "@/pages/Home.jsx";     // can be a short “signed-in landing” or redirect
import Game from "@/pages/Game.jsx";
import Login from "@/pages/Login.jsx";
import Signup from "@/pages/Signup.jsx";
import Profile from "@/pages/Profile.jsx";
import Privacy from "@/components/Legal/Privacy.jsx";
import Terms from "@/components/Legal/Terms.jsx";

export default function App() {
  return (
    <Suspense>
      <Routes>
        {/* Auth-first gate: default to Login */}
        <Route element={<PublicLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Route>

        {/* Signed-in application */}
        <Route
          element={
            <ProtectedRoute requireEmailVerified={false}>
              <AuthedLayout />
            </ProtectedRoute>
          }
        >
          {/* Signed-in landing can be Game or Home; I’m sending to Game directly */}
          <Route path="/home" element={<Home />} />
          <Route path="/game" element={<Game />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function NotFound() {
  const loc = useLocation();
  return (
    <div className="p-8">
      <h1 className="text-xl font-bold">404</h1>
      <p className="opacity-70">No route: {loc.pathname}</p>
    </div>
  );
}
