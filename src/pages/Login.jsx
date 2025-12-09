// src/pages/Login.jsx
// @ts-nocheck

import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, Link, useLocation } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "@/firebase.js";
import { selectUser } from "@/redux/userSlice.js";

export default function LoginPage() {
  const user = useSelector(selectUser);
  const isLoggedIn = !!user;
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
    <div className="flex flex-col items-center w-full h-full pt-6 pb-10 bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">
      {/* Title */}
      <div className="flex flex-col items-center mb-6">
        <h1 className="text-4xl font-bold tracking-wide text-emerald-400 drop-shadow-lg">
          DOGGERZ
        </h1>
        <p className="text-sm text-zinc-300 mt-1">Virtual Pup Simulator</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-xl font-semibold mb-2">Log in</h2>
        <p className="text-sm text-zinc-400 mb-4">
          Log in to keep your pup synced, protect your progress, and eventually
          unlock cross-device play.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-zinc-200 mb-1"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-zinc-200 mb-1"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-xs text-red-400 mt-1">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-sm font-semibold shadow-lg"
          >
            {submitting ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="mt-4 text-xs text-zinc-400 flex items-center justify-between">
          <span>Don&apos;t have an account?</span>
          <Link
            to="/signup"
            className="text-emerald-400 hover:text-emerald-300 font-medium"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
