// src/routes/ProtectedRoute.jsx
import React, { useEffect, useRef, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
// optional: if you want guest-mode to pass
// import { useSelector } from "react-redux";

export default function ProtectedRoute({
  redirect = "/login",
  requireEmailVerified = false,   // if true, unverified users get redirected
  allowGuests = false,            // if true, let Redux "guest" users pass
  fallback = <div className="min-h-[40vh]" />, // skeleton while hydrating
}) {
  const location = useLocation();

  // Seed from currentUser to reduce flicker; we'll still wait for the first event
  const [user, setUser] = useState(() => auth.currentUser ?? undefined);
  const hydratedRef = useRef(false);

  // If you want to allow Redux guest users, uncomment:
  // const isGuest = useSelector((s) => !!s.user?.isGuest);

  useEffect(() => {
    let cancelled = false;
    const unsub = onAuthStateChanged(auth, (u) => {
      if (cancelled) return;
      hydratedRef.current = true;
      setUser(u || null);
    });
    return () => {
      cancelled = true;
      try { unsub(); } catch {}
    };
  }, []);

  // Still hydrating
  if (!hydratedRef.current && user === undefined) return fallback;

  // Optional: allow guest users (Redux) to pass certain routes
  // if (allowGuests && isGuest) return <Outlet />;

  // Not signed in
  if (!user) {
    return (
      <Navigate
        to={redirect}
        replace
        state={{ from: location }}
      />
    );
  }

  // Optional: block unverified accounts
  if (requireEmailVerified && user.email && !user.emailVerified) {
    return (
      <Navigate
        to={`${redirect}?reason=email_unverified`}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
