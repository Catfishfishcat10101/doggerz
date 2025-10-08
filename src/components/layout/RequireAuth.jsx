// src/layout/RequireAuth.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { selectUser, selectUserStatus } from "@/redux/userSlice";

/**
 * RequireAuth
 * - Blocks unauthenticated users.
 * - Shows a minimal spinner while auth state is resolving.
 * - Optionally enforces email verification (toggle EMAIL_VERIFY_REQUIRED).
 *
 * Usage A (wrap children): <RequireAuth><AuthLayout /></RequireAuth>
 * Usage B (as route element): <Route element={<RequireAuth.Outlet />}> ... </Route>
 */
const EMAIL_VERIFY_REQUIRED = false; // flip to true if you enforce verified emails

function Gate({ children }) {
  const user = useSelector(selectUser);
  const status = useSelector(selectUserStatus); // "idle" | "loading" | "authed" | "error"
  const location = useLocation();

  // While Firebase restores session, avoid redirect ping-pong
  if (status === "loading" || status === "idle") {
    return (
      <div className="grid min-h-[40vh] place-items-center">
        <Spinner label="Checking session…" />
      </div>
    );
  }

  // Not signed in → push to login with smart return URL
  if (!user?.uid) {
    const from = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to="/login" replace state={{ from }} />;
  }

  // Optional: email verification / disabled guardrails
  if (EMAIL_VERIFY_REQUIRED && user.email && user.emailVerified === false) {
    return <Navigate to="/verify-email" replace state={{ from: location.pathname }} />;
  }
  if (user.disabled) {
    return <Navigate to="/account-disabled" replace />;
  }

  return <>{children}</>;
}

// Variant for route trees using <Outlet />
function GateOutlet() {
  return (
    <Gate>
      <Outlet />
    </Gate>
  );
}

export default function RequireAuth({ children }) {
  return <Gate>{children}</Gate>;
}

// Named export for ergonomic routing: element={<RequireAuth.Outlet />}
RequireAuth.Outlet = GateOutlet;

/** Minimal accessible spinner */
function Spinner({ label = "Loading…" }) {
  return (
    <div role="status" aria-live="polite" className="flex items-center gap-3">
      <svg
        className="h-5 w-5 animate-spin"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25" />
        <path d="M22 12a10 10 0 0 1-10 10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      </svg>
      <span className="text-sm text-zinc-300">{label}</span>
    </div>
  );
}
