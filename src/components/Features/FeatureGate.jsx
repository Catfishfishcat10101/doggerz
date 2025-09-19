// src/components/Features/FeatureGate.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
// Only rely on selectors you actually have:
import { selectHappiness } from "../../redux/dogSlice";

/**
 * FeatureGate
 *
 * Usage:
 *  <FeatureGate requiresAuth minHappiness={50} minXP={100} onlineOnly
 *               requireAnyFlags={["VITE_EXPERIMENT_SHOP_V2"]}
 *               requirePWA
 *               isEnabled={(ctx) => ctx.happiness >= 80 || ctx.isGuest}
 *               renderLocked={(ctx) => <MyLockedCard ctx={ctx} />}
 *  >
 *    <Shop />     // only renders when all checks pass
 *  </FeatureGate>
 *
 * Props:
 * - requiresAuth?: boolean           // Firebase auth required (truthy if auth.currentUser)
 * - allowGuest?: boolean             // allow guest mode (Redux user.uid present) to pass auth check
 * - minHappiness?: number            // gate by happiness %
 * - minXP?: number                   // gate by XP (reads s.dog?.xp)
 * - onlineOnly?: boolean             // require navigator.onLine
 * - requirePWA?: boolean             // require display-mode "standalone"
 * - requireAllFlags?: string[]       // all env vars must be truthy
 * - requireAnyFlags?: string[]       // at least one env var must be truthy
 * - isEnabled?: (ctx) => boolean     // custom predicate in addition to above
 * - fallback?: ReactNode             // fallback node if locked (default smart card)
 * - renderLocked?: (ctx) => ReactNode// render-prop locked UI (overrides fallback)
 * - redirectTo?: string              // CTA destination when locked (default: "/login" if requiresAuth, else "/")
 *
 * ctx exposed to renderLocked:
 *   { isAuthed, isGuest, happiness, xp, online, pwa, flags:Record<string,boolean>, reasons:string[] }
 */

export default function FeatureGate({
  children,
  requiresAuth = false,
  allowGuest = false,
  minHappiness,
  minXP,
  onlineOnly = false,
  requirePWA = false,
  requireAllFlags,
  requireAnyFlags,
  isEnabled,
  fallback,
  renderLocked,
  redirectTo,
}) {
  // --- Lightweight state reads (no brittle imports) ---
  const reduxUser = useSelector((s) => s.user || {});
  const uid = reduxUser?.uid ?? null;
  const isGuest = !!uid && !window?.auth?.currentUser; // soft heuristic if you ever attach auth to window
  const happiness = useSelector(selectHappiness) ?? 0;
  const xp = useSelector((s) => s.dog?.xp ?? 0);

  // --- Environment / platform checks (safe in any browser) ---
  const online = typeof navigator !== "undefined" ? !!navigator.onLine : true;
  const displayModeStandalone = isStandalone();

  // Firebase auth (optional import pattern avoided here to not hard-require firebase in this file)
  const isAuthed = safeGetAuthCurrentUser();

  // Env flags: treat "1", "true", non-empty strings as truthy
  const flagTruth = (name) => {
    const v = import.meta?.env?.[name];
    if (v === undefined || v === null) return false;
    const s = String(v).trim().toLowerCase();
    return s === "1" || s === "true" || s === "yes" || s === "on" || (s !== "" && s !== "0" && s !== "false");
    // e.g., VITE_EXPERIMENT_SHOP_V2=true
  };

  const flags = useMemo(() => {
    const bag = {};
    (requireAllFlags || []).forEach((f) => (bag[f] = flagTruth(f)));
    (requireAnyFlags || []).forEach((f) => (bag[f] = flagTruth(f)));
    return bag;
  }, [requireAllFlags, requireAnyFlags]);

  // Compute reasons for locking (for great UX + analytics)
  const { allowed, reasons } = useMemo(() => {
    const reasons = [];

    if (requiresAuth) {
      const passesAuth = isAuthed || (allowGuest && !!uid);
      if (!passesAuth) reasons.push("auth");
    }

    if (typeof minHappiness === "number" && happiness < minHappiness) {
      reasons.push("happiness");
    }

    if (typeof minXP === "number" && xp < minXP) {
      reasons.push("xp");
    }

    if (onlineOnly && !online) {
      reasons.push("offline");
    }

    if (requirePWA && !displayModeStandalone) {
      reasons.push("pwa");
    }

    if (Array.isArray(requireAllFlags) && requireAllFlags.length > 0) {
      const allOK = requireAllFlags.every(flagTruth);
      if (!allOK) reasons.push("flags_all");
    }

    if (Array.isArray(requireAnyFlags) && requireAnyFlags.length > 0) {
      const anyOK = requireAnyFlags.some(flagTruth);
      if (!anyOK) reasons.push("flags_any");
    }

    const ctx = {
      isAuthed,
      isGuest,
      happiness,
      xp,
      online,
      pwa: displayModeStandalone,
      flags,
      reasons,
    };

    if (typeof isEnabled === "function") {
      const custom = !!isEnabled(ctx);
      if (!custom) reasons.push("custom");
    }

    return { allowed: reasons.length === 0, reasons };
  }, [
    requiresAuth,
    allowGuest,
    uid,
    isAuthed,
    minHappiness,
    happiness,
    minXP,
    xp,
    onlineOnly,
    online,
    requirePWA,
    displayModeStandalone,
    requireAllFlags,
    requireAnyFlags,
    flags,
    isEnabled,
    isGuest,
  ]);

  if (allowed) return <>{children}</>;

  const ctx = {
    isAuthed,
    isGuest,
    happiness,
    xp,
    online,
    pwa: displayModeStandalone,
    flags,
    reasons,
  };

  if (typeof renderLocked === "function") {
    return <>{renderLocked(ctx)}</>;
  }

  return (
    <>
      {fallback ?? <DefaultLockedCard ctx={ctx} redirectTo={resolveRedirect(redirectTo, requiresAuth)} />}
    </>
  );
}

/* ---------------- helpers / small UI ---------------- */

function DefaultLockedCard({ ctx, redirectTo }) {
  const { reasons, happiness, xp, online, pwa } = ctx;
  const missing = new Set(reasons);

  const lines = [];
  if (missing.has("auth")) lines.push("Sign in required.");
  if (missing.has("happiness")) lines.push(`Happiness too low (${Math.round(happiness)}%).`);
  if (missing.has("xp")) lines.push(`Need more XP (${xp}).`);
  if (missing.has("offline")) lines.push("This feature requires an internet connection.");
  if (missing.has("pwa")) lines.push("Install the app to unlock this feature (PWA).");
  if (missing.has("flags_all")) lines.push("Feature flag not enabled.");
  if (missing.has("flags_any")) lines.push("No eligible experiment flag enabled.");
  if (missing.has("custom")) lines.push("Not available yet.");

  return (
    <div className="max-w-xl mx-auto my-4 rounded-2xl border bg-white p-4 text-emerald-900">
      <div className="font-semibold">Feature locked</div>
      <ul className="mt-2 text-sm list-disc pl-5 space-y-1">
        {lines.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap gap-2">
        {!online && (
          <span className="px-3 py-1.5 rounded-lg border bg-white text-xs">You’re offline</span>
        )}
        {!pwa && (
          <Link
            to="/help"
            className="px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-50 text-xs"
          >
            How to install
          </Link>
        )}
        <Link
          to={redirectTo}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs"
        >
          Continue
        </Link>
      </div>
    </div>
  );
}

function resolveRedirect(redirectTo, requiresAuth) {
  if (redirectTo) return redirectTo;
  return requiresAuth ? "/login" : "/";
}

// Detect PWA display mode safely
function isStandalone() {
  try {
    // iOS
    if (window.navigator.standalone) return true;
    // Spec
    if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
  } catch {}
  return false;
}

// Get Firebase currentUser without hard importing firebase here.
// If you want strict typing, import { auth } from "../../firebase" and read auth.currentUser directly.
function safeGetAuthCurrentUser() {
  try {
    // If your firebase exports `auth`, prefer importing it and reading `auth.currentUser`.
    // This indirection avoids coupling if this file is used in non-auth builds.
    if (window?.auth && "currentUser" in window.auth) return !!window.auth.currentUser;
  } catch {}
  // Try a global guard your app might set in AuthListener
  try {
    if ("__DOGGERZ_AUThed__" in window) return !!window.__DOGGERZ_AUThed__;
  } catch {}
  return false;
}
// --- End FeatureGate.jsx ---