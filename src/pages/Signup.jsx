// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PATHS } from "../routes.js";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase.js";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please provide email and password.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // On success, send user to adopt flow
      nav(PATHS.ADOPT);
    } catch (err) {
      setError(err.message || "Failed to create account");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold text-center">Create your Doggerz account</h1>

        <p className="text-sm text-zinc-400 text-center">
          Create an account to persist your pup to the cloud.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-950/20 p-2 rounded">{error}</div>
          )}

          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold py-2.5 text-sm transition disabled:opacity-50"
          >
            {busy ? "Creating…" : "Sign up"}
          </button>
        </form>

        <p className="text-xs text-zinc-400 text-center">
          Already have an account?{" "}
          <Link
            to={PATHS.LOGIN}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
