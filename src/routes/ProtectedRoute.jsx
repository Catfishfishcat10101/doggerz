// src/routes/ProtectedRoute.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onIdTokenChanged, getIdTokenResult } from "firebase/auth";
import { auth } from "@/lib/firebase";              // keep your path if that's where it is
import { PATHS } from "@/routes/index.jsx";         // <-- add
import { rememberReturnTo } from "@/utils/nextRouteAfterAuth.js"; // <-- add

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
    if (!auth) {
      setState({ loading: false, user: null, claims: null });
      return;
    }
    const unsub = onIdTokenChanged(auth, async (fbUser) => {
      if (!mounted.current) return;
      if (!fbUser) {
        setState({ loading: false, user: null, claims: null });
        return;
      }
      try {
        const res = await getIdTokenResult(fbUser);
        if (!mounted.current) return;
        setState({ loading: false, user: fbUser, claims: res?.claims || {} });
      } catch {
        setState({ loading: false, user: fbUser, claims: null });
      }
    });
    return () => {
      mounted.current = false;
      unsub?.();
    };
  }, []);

  if (state.loading) return fallback;

  // Unauthed → remember where we were and send to /login?returnTo=...
  if (!state.user) {
    rememberReturnTo(loc);
    const ret = encodeURIComponent(loc.pathname + (loc.search || ""));
    return <Navigate to={`${PATHS.LOGIN}?returnTo=${ret}`} replace />;
  }

  // Email verification gate
  if (requireEmailVerified && state.user.email && !state.user.emailVerified) {
    return <GateMessage title="Verify your email to continue" body="We sent a verification link. After verifying, reload this page." />;
  }

  // Claims/role gate
  const missingClaims = useMissingClaims(requireClaims, state.claims);
  if (missingClaims.length > 0) {
    return <GateMessage title="Insufficient permissions" body={`Missing required access: ${missingClaims.join(", ")}`} />;
  }

  return children;
}
