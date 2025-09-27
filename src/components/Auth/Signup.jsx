import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { nextRouteAfterAuth } from "@/utils/nextRouteAfterAuth.js";

export default function Signup() {
  const nav = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const busy = loading || !auth;

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      if (displayName.trim()) {
        await updateProfile(user, { displayName: displayName.trim() });
      }
      nav(nextRouteAfterAuth());
    } catch (e) {
      console.error("Signup error:", e.code, e.message);
      const map = {
        "auth/email-already-in-use": "That email already has an account.",
        "auth/invalid-email": "That email looks invalid.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/operation-not-allowed":
          "Email/Password is disabled for this project.",
        "auth/network-request-failed": "Network error. Check connection.",
      };
      setErr(map[e.code] ?? "Signup failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-yellow-50 text-slate-900 grid place-items-center p-6">
      <div className="w-full max-w-md card p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Create your account</h1>

        {err ? (
          <p className="mt-3 text-sm text-red-600" role="alert">{err}</p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            className="input"
            placeholder="Display name (optional)"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={busy}
          />
          <input
            type="email"
            className="input"
            placeholder="you@example.com"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
            required
          />
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={busy}
            required
            minLength={6}
          />
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={busy || !email.trim() || password.length < 6}
          >
            {loading ? "Creating…" : "Sign up"}
          </button>
        </form>

        <div className="mt-6 text-sm text-slate-700">
          Already have an account?{" "}
          <Link to="/login" className="underline">Log in</Link>
        </div>
      </div>
    </div>
  );
}
