// src/pages/Signup.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, firebaseReady } from "@/firebase.js";
import PageShell from "@/components/PageShell.jsx";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError(null);

    if (!firebaseReady || !auth) {
      setError(
        "Cloud signup is disabled because Firebase isn't configured. You can still play in offline mode.",
      );
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      const cred = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password,
      );

      const name = String(displayName || "").trim();
      if (name) {
        try {
          await updateProfile(cred.user, { displayName: name });
        } catch (e) {
          console.warn("[Signup] updateProfile failed", e);
        }
      }

      // After signup, send them into the game.
      navigate("/game", { replace: true });
    } catch (err) {
      console.error("[Signup] signup error:", err);
      let message = "Signup failed. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        message = "That email is already in use. Try logging in instead.";
      } else if (err.code === "auth/invalid-email") {
        message = "That email address doesn’t look valid.";
      } else if (err.code === "auth/weak-password") {
        message = "Password is too weak. Try at least 6 characters.";
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-zinc-700 dark:text-zinc-300 mb-6">
          Save your pup, your streaks, and your Doggerz coins across devices.
        </p>

        {!firebaseReady && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-900 dark:text-amber-200">
            <p className="font-medium">Cloud signup is currently disabled.</p>
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

        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl bg-white/80 p-6 border border-zinc-200 dark:bg-zinc-900/70 dark:border-zinc-800"
        >
          <div className="space-y-2">
            <label
              htmlFor="displayName"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Display name
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={32}
              className="w-full rounded-md bg-white border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              placeholder="William"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-white border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-800 dark:text-zinc-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md bg-white border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-950 dark:border-zinc-700 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !firebaseReady}
            className="w-full rounded-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-black font-semibold text-sm py-2.5 transition"
          >
            {submitting ? "Creating account…" : "Sign up"}
          </button>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <p className="text-xs text-zinc-600 dark:text-zinc-400 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-700 hover:text-emerald-600 dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              Log in
            </Link>
            .
          </p>
        </form>
      </div>
    </PageShell>
  );
}
