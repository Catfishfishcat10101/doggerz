import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { nextRouteAfterAuth } from "@/utils/nextRouteAfterAuth.js";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const busy = loading || !auth;

  async function onEmailLogin(e) {
    e.preventDefault();
    if (busy) return;
    setErr("");
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      nav(nextRouteAfterAuth());
    } catch (e) {
      console.error("Email login:", e.code, e.message);
      const map = {
        "auth/invalid-credential": "Wrong email or password.",
        "auth/invalid-email": "That email looks invalid.",
        "auth/user-not-found": "No account with that email.",
        "auth/wrong-password": "Wrong password.",
        "auth/too-many-requests": "Too many attempts. Try later.",
        "auth/network-request-failed": "Network error. Check connection.",
        "auth/operation-not-allowed": "Email/Password is disabled in Firebase.",
      };
      setErr(map[e.code] ?? "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    if (busy) return;
    setErr("");
    setLoading(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      googleProvider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, googleProvider);
      nav(nextRouteAfterAuth());
    } catch (e) {
      console.error("Google sign-in:", e.code, e.message);
      const map = {
        "auth/operation-not-allowed": "Google provider is disabled in Firebase.",
        "auth/unauthorized-domain": "Add localhost/127.0.0.1 to Authorized domains.",
        "auth/popup-blocked": "Popup was blocked.",
        "auth/popup-closed-by-user": "You closed the popup.",
        "auth/network-request-failed": "Network error. Check connection.",
      };
      setErr(map[e.code] ?? "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-yellow-50 text-slate-900 grid place-items-center p-6">
      <div className="w-full max-w-md card p-6 sm:p-8">
        <h1 className="text-2xl font-bold">Welcome back</h1>

        {err ? (
          <p className="mt-3 text-sm text-red-600" role="alert">{err}</p>
        ) : null}

        <form onSubmit={onEmailLogin} className="mt-6 space-y-4">
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
            autoComplete="current-password"
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
            {loading ? "Logging in…" : "Log in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">or</div>

        <button
          onClick={onGoogle}
          className="btn btn-ghost w-full mt-3"
          disabled={busy}
        >
          Continue with Google
        </button>

        <div className="mt-6 text-sm text-slate-700">
          New here?{" "}
          <Link to="/signup" className="underline">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
