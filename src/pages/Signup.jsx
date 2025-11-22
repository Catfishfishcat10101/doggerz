// src/pages/Signup.jsx
// @ts-nocheck

import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { Link, useNavigate, useLocation } from "react-router-dom";

import { auth, googleProvider } from "@/firebase.js";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/game";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");

  async function handleEmailSignup(e) {
    e.preventDefault();
    setError("");

    if (!email || !password || !passwordConfirm) {
      setError("Fill in all fields.");
      return;
    }
    if (password !== passwordConfirm) {
      setError("Passwords don&apos;t match.");
      return;
    }
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }

    setLoadingEmail(true);
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      let msg = "Could not create your account.";
      if (err.code === "auth/email-already-in-use") {
        msg = "That email already has an account.";
      } else if (err.code === "auth/invalid-email") {
        msg = "That doesn&apos;t look like a valid email.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak. Try something beefier.";
      }
      setError(msg);
    } finally {
      setLoadingEmail(false);
    }
  }

  async function handleGoogleSignup() {
    setError("");
    setLoadingGoogle(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate(from, { replace: true });
    } catch (err) {
      console.error(err);
      setError("Google sign-up failed. Try again or use email/password.");
    } finally {
      setLoadingGoogle(false);
    }
  }

  return (
    <main className="min-h-[calc(100vh-56px)] bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_18px_rgba(16,185,129,0.9)]">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Claim one pup per account and keep its streak alive.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-slate-950/80 p-6 shadow-lg shadow-emerald-500/10">
          {error && (
            <div className="mb-4 rounded-md border border-red-500/60 bg-red-950/60 px-3 py-2 text-xs text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-zinc-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-zinc-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="passwordConfirm"
                className="block text-xs font-medium uppercase tracking-[0.18em] text-zinc-400"
              >
                Confirm password
              </label>
              <input
                id="passwordConfirm"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-zinc-800 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loadingEmail}
              className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-md shadow-emerald-500/40 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loadingEmail ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3 text-[0.7rem] text-zinc-500">
            <div className="h-px flex-1 bg-zinc-800" />
            <span>or</span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={loadingGoogle}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-zinc-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-zinc-100 hover:border-emerald-400 hover:text-emerald-300 hover:bg-slate-900/80 disabled:cursor-not-allowed disabled:opacity-70 transition"
          >
            {loadingGoogle ? (
              "Connecting to Google…"
            ) : (
              <>
                <span className="inline-block h-4 w-4 rounded-sm bg-white" />
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          <div className="mt-4 text-center text-xs text-zinc-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-emerald-300 hover:text-emerald-200"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
