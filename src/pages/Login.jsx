// src/pages/Login.jsx

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, Link, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth, firebaseReady } from "@/firebase.js";
import { selectIsLoggedIn } from "@/redux/userSlice.js";
import PageShell from "@/components/PageShell.jsx";

export default function LoginPage() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const location = useLocation();

  // So we can send them back where they came from later if needed
  const from = location.state?.from || "/game";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (isLoggedIn) {
    // Already logged in? Don’t even show the screen.
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!firebaseReady || !auth) {
      setError(
        "Firebase is not configured. Add your VITE_FIREBASE_* keys to .env.local to enable login, or continue in offline mode.",
      );
      return;
    }

    if (!email.trim() || !password) {
      setError("Email and password are both required.");
      return;
    }

    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error("[Login] signIn error:", err);
      let message = "Login failed. Double-check your email and password.";

      if (err.code === "auth/user-not-found") {
        message = "No account found for that email.";
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (err.code === "auth/too-many-requests") {
        message =
          "Too many attempts. Take a breath, wait a bit, and try again.";
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900/70">
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
            Account
          </p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-white">Log in</h2>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Log in to keep your pup synced, protect your progress, and eventually
            unlock cross-device play.
          </p>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            {!firebaseReady && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
                <p className="font-medium">Cloud login is currently disabled.</p>
                <p className="mt-1 text-amber-900/80 dark:text-amber-200/80">
                  To enable it, set your Firebase web config in <code>.env.local</code> (see <code>.env.example</code>).
                  Until then, you can still play in local-only mode.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/game", { replace: true })}
                  className="mt-3 inline-flex items-center justify-center rounded-lg bg-amber-400 px-3 py-2 text-xs font-semibold text-black hover:bg-amber-300"
                >
                  Continue offline
                </button>
              </div>
            )}

          <div>
            <label
              htmlFor="login-email"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 mt-1">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting || !firebaseReady}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-sm font-semibold text-black shadow-lg"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

          <div className="mt-4 text-xs text-zinc-600 dark:text-zinc-400 flex items-center justify-between">
          <span>
            Don&apos;t have an account?
          </span>
          <Link
            to="/signup"
              className="text-emerald-700 hover:text-emerald-600 font-medium dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            Sign up
          </Link>
        </div>
        </div>
      </div>
    </PageShell>
  );
}
