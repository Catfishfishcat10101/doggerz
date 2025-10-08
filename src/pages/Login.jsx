// src/pages/Login.jsx
import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import AuthButtons from "@/components/Auth/AuthButtons.jsx";
import { rememberReturnTo, nextRouteAfterAuth, clearReturnTo } from "@/utils/nextRouteAfterAuth.js";
import { PATHS } from "@/config/routes.js";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();

  // If a guard sent us here with a `from`, honor it
  const hintedFrom = loc.state?.from;
  const fallback = nextRouteAfterAuth() || PATHS.GAME;

  function handleSuccess() {
    const dest = hintedFrom || fallback;
    clearReturnTo();
    nav(dest, { replace: true });
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-extrabold">Log in</h1>
      <p className="mt-2 text-slate-300">
        New here? <Link to={PATHS.SIGNUP} className="text-amber-300 hover:underline">Create an account</Link>.
      </p>

      <div className="mt-6">
        <AuthButtons mode="login" onSuccess={handleSuccess} />
      </div>

      {/* optional: if arriving from a CTA, store the target before sending to login */}
      {/* rememberReturnTo(PATHS.GAME);  -> call this in the place that redirects to /login */}
    </main>
  );
}
