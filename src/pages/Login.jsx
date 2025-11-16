// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PATHS } from "../routes.js";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "@/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [remember, setRemember] = useState(true);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [info, setInfo] = useState(null);

  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setBusy(true);
    try {
      // Apply chosen persistence before sign-in
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );

      await signInWithEmailAndPassword(auth, email, password);

      // After login, check for existing dog document and route appropriately
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const ref = doc(db, "dogs", uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            nav(PATHS.GAME);
            return;
          }
        }
      } catch (innerErr) {
        // ignore and fall through to adopt
      }

      nav(PATHS.ADOPT);
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      await setPersistence(
        auth,
        remember ? browserLocalPersistence : browserSessionPersistence
      );
      await signInWithPopup(auth, googleProvider);

      // route same as email sign-in
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const ref = doc(db, "dogs", uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            nav(PATHS.GAME);
            return;
          }
        }
      } catch (innerErr) {
        // ignore
      }
      nav(PATHS.ADOPT);
    } catch (err) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setBusy(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e?.preventDefault?.();
    setError(null);
    setInfo(null);
    if (!resetEmail && !email) {
      setError("Enter the email address to reset your password.");
      return;
    }
    const targetEmail = resetEmail || email;
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setInfo("Password reset email sent. Check your inbox.");
      setShowReset(false);
      setResetEmail("");
    } catch (err) {
      setError(err.message || "Failed to send reset email");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold text-center">Sign in to Doggerz</h1>

        <p className="text-sm text-zinc-400 text-center">
          Sign in with your email and password, or create an account if you
          don't have one yet.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-950/20 p-2 rounded">{error}</div>
          )}
          {info && (
            <div className="text-sm text-sky-300 bg-sky-950/10 p-2 rounded">{info}</div>
          )}

          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
              placeholder="you@example.com"
              aria-label="Email address"
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
              placeholder="••••••••"
              aria-label="Password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="inline-flex items-center text-sm text-zinc-300">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="mr-2 h-4 w-4 rounded bg-zinc-800 border-zinc-700"
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() => setShowReset((s) => !s)}
              className="text-sm text-sky-400 hover:text-sky-300"
            >
              Forgot password?
            </button>
          </div>

          {showReset ? (
            <form onSubmit={handlePasswordReset} className="space-y-2">
              <div className="text-sm text-zinc-300">Enter email to reset password</div>
              <input
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                placeholder="you@example.com"
                aria-label="Reset email"
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePasswordReset}
                  disabled={busy}
                  className="flex-1 rounded-md bg-amber-500 text-zinc-950 py-2 text-sm font-semibold"
                >
                  {busy ? "Sending…" : "Send reset email"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  className="flex-1 rounded-md border border-zinc-700 text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : null}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 font-semibold py-2.5 text-sm transition disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="pt-2">
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center" aria-hidden>
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-zinc-950 px-2 text-zinc-400">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignIn}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 py-2 text-sm hover:bg-zinc-900/80 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.35 11.1H12v2.8h5.35c-.23 1.3-1.08 2.4-2.3 3.14v2.6h3.72c2.18-2.01 3.44-4.96 3.44-8.54 0-.58-.05-1.15-.15-1.7z" fill="#4285F4" />
              <path d="M12 22c2.7 0 4.96-.9 6.62-2.44l-3.72-2.6c-1.06.72-2.42 1.14-4.9 1.14-3.76 0-6.95-2.54-8.09-5.96H.98v2.66C2.64 19.86 7.92 22 12 22z" fill="#34A853" />
              <path d="M3.91 13.14a8.001 8.001 0 010-2.28V8.2H.98A12.003 12.003 0 000 12c0 1.94.45 3.77 1.26 5.4l2.65-2.26z" fill="#FBBC05" />
              <path d="M12 4.6c1.47 0 2.8.5 3.85 1.48l2.87-2.87C16.98 1.5 14.7.6 12 .6 7.92.6 2.64 2.74.98 6.2l2.93 2.66C5.05 6.99 8.24 4.6 12 4.6z" fill="#EA4335" />
            </svg>
            <span>Sign in with Google</span>
          </button>
        </div>

        <p className="text-xs text-zinc-400 text-center">
          Need an account? {" "}
          <Link to={PATHS.SIGNUP} className="text-sky-400 hover:text-sky-300">
            Sign up
          </Link>
        </p>

        <p className="text-xs text-zinc-500 text-center">
          Once this shell feels right, we'll replace this form logic with
          real Firebase auth.
        </p>
      </div>
    </div>
  );
}
