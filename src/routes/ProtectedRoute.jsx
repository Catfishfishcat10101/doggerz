// src/routes/ProtectedRoute.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onIdTokenChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "@/firebase";

/**
 * ProtectedRoute
 *
 * Props:
 * - children: ReactNode
 * - requireEmailVerified?: boolean (default false)
 * - requireClaims?: string[] (claim keys that must be truthy on the token)
 * - fallback?: ReactNode (rendered while authenticating)
 *
 * Behavior:
 * - Subscribes to Firebase token changes (sign-in/out + refresh)
 * - Redirects to /login if unauthenticated, preserving `from` for post-login
 * - Optionally enforces email verification and required custom claims
 */
export default function ProtectedRoute({
  children,
  requireEmailVerified = false,
  requireClaims = [],
  fallback = <DefaultFallback />,
}) {
  const loc = useLocation();
  const [state, setState] = useState({ loading: true, user: null, claims: null });
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      if (!mounted.current) return;

      if (!fbUser) {
        setState({ loading: false, user: null, claims: null });
        return;
      }

      // Pull (cached) token result to read claims/verification
      try {
        const res = await getIdTokenResult(fbUser);
        if (!mounted.current) return;
        setState({
          loading: false,
          user: fbUser,
          claims: res?.claims || {},
        });
      } catch {
        // Non-fatal; proceed with user sans claims
        setState({ loading: false, user: fbUser, claims: null });
      }
    });

    return () => {
      mounted.current = false;
      unsub?.();
    };
  }, []);

  if (state.loading) return fallback;

  // Unauthed → login with redirect memory
  if (!state.user) {
    return <Navigate to="/login" replace state={{ from: loc }} />;
  }

  // Email verification gate
  if (requireEmailVerified && state.user.email && !state.user.emailVerified) {
    return (
      <GateMessage
        title="Verify your email to continue"
        body="We sent a verification link to your inbox. Once verified, reload this page."
      />
    );
  }

  // Claims/role gate
  const missingClaims = useMissingClaims(requireClaims, state.claims);
  if (missingClaims.length > 0) {
    return (
      <GateMessage
        title="Insufficient permissions"
        body={`Your account is missing required access: ${missingClaims.join(", ")}`}
      />
    );
  }

  // All good
  return children;
}

/* --------------------- helpers & UI bits --------------------- */

function useMissingClaims(keys = [], claims) {
  return useMemo(() => {
    if (!keys?.length) return [];
    if (!claims) return keys.slice(); // if we couldn't fetch claims yet
    return keys.filter((k) => !Boolean(claims?.[k]));
  }, [keys, claims]);
}

function DefaultFallback() {
  return (
    <div className="min-h-screen grid place-items-center bg-white dark:bg-slate-950">
      <div className="rounded-2xl border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow">
        <div className="h-5 w-40 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
        <div className="mt-3 h-3 w-64 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </div>
    </div>
  );
}

function GateMessage({ title, body }) {
  return (
    <div className="min-h-screen grid place-items-center bg-white dark:bg-slate-950">
      <div className="max-w-md rounded-2xl border border-amber-300/50 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-100 p-6 shadow">
        <div className="font-semibold">{title}</div>
        <div className="text-sm opacity-80 mt-1">{body}</div>
      </div>
    </div>
  );
}
