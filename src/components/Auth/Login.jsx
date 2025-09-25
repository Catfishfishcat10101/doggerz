// src/components/Auth/Login.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
} from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { Link, useLocation, useNavigate } from "react-router-dom";

/**
 * Login
 * - Email/password auth with remember-me (session vs. local persistence)
 * - Google OAuth
 * - Proper error mapping, keyboard/focus hygiene, a11y live regions
 * - Redirects to `location.state.from` or /game on success
 */
export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const from = useMemo(
    () => loc.state?.from?.pathname || "/game",
    [loc.state]
  );

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const errLiveRef = useRef(null);

  useEffect(() => {
    if (err && errLiveRef.current) {
      // ensure SRs announce fresh errors
      errLiveRef.current.focus();
    }
  }, [err]);

  const mapError = (code, message) => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password.";
      case "auth/too-many-requests":
        return "Too many attempts. Try again later.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed.";
      case "auth/popup-blocked":
        return "Popup blocked by the browser. Allow popups and retry.";
      case "auth/network-request-failed":
        return "Network error. Check your connection.";
      default:
        return message || "Authentication failed.";
    }
  };

  const setAuthPersistence = async (persist) => {
    await setPersistence(auth, persist ? browserLocalPersistence : browserSessionPersistence);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      await setAuthPersistence(remember);
      await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), pw);
      nav(from, { replace: true });
    } catch (e2) {
      setErr(mapError(e2.code, e2.message));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setErr("");
    setBusy(true);
    try {
      await setAuthPersistence(remember);
      await signInWithPopup(auth, googleProvider);
      nav(from, { replace: true });
    } catch (e2) {
      setErr(mapError(e2.code, e2.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-[92%] max-w-md">
        <div className="rounded-3xl border border-black/5 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-xl">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/icons/icon-192.png" alt="" className="h-7 w-7 rounded-lg" />
              <h1 className="text-xl font-extrabold tracking-tight">Doggerz</h1>
            </div>
            <Link
              to="/signup"
              className="text-sm font-semibold text-sky-600 hover:underline underline-offset-4"
            >
              Create account
            </Link>
          </header>

          <form onSubmit={onSubmit} className="mt-6 grid gap-3">
            <label className="text-sm font-medium" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              required
            />

            <div className="flex items-center justify-between mt-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <Link to="/login/reset" className="text-xs text-sky-600 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPw ? "text" : "password"}
                className="w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 pr-12 outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                placeholder="••••••••"
                autoComplete="current-password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={busy}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs rounded-lg px-2 py-1 bg-slate-100 dark:bg-slate-700"
                aria-pressed={showPw}
                aria-label={showPw ? "Hide password" : "Show password"}
                disabled={busy}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </div>

            <label className="mt-2 inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={busy}
              />
              Keep me signed in on this device
            </label>

            <button
              type="submit"
              disabled={busy}
              className="mt-2 rounded-2xl bg-sky-600 text-white font-semibold px-4 py-2.5 hover:brightness-110 active:brightness-95 disabled:opacity-60"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>

            <button
              type="button"
              onClick={onGoogle}
              disabled={busy}
              className="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-slate-800 px-4 py-2.5 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            {/* Error live region */}
            <div
              ref={errLiveRef}
              tabIndex={-1}
              aria-live="assertive"
              className={[
                "min-h-[1rem] text-sm",
                err ? "text-rose-600 dark:text-rose-400 mt-1" : "sr-only",
              ].join(" ")}
            >
              {err}
            </div>
          </form>

          <footer className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            By continuing you agree to the cozy dog terms: treat often, pet generously.
          </footer>
        </div>

        <div className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
          Need an account? <Link to="/signup" className="text-sky-600 hover:underline">Sign up</Link>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Inline icon ----------------------- */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.4 4-5.2 6.9-9.3 6.9-5.7 0-10.3-4.6-10.3-10.3S20.3 14.3 26 14.3c2.6 0 5 .9 6.9 2.6l5.6-5.6C35.2 8.3 30.9 6.6 26 6.6 15.2 6.6 6.6 15.2 6.6 26S15.2 45.4 26 45.4 45.4 36.8 45.4 26c0-1.9-.2-3.2-.5-5.5z"/>
      <path fill="#FF3D00" d="M7.9 14.7l6.6 4.8C16.3 16.6 20.9 14.3 26 14.3c2.6 0 5 .9 6.9 2.6l5.6-5.6C35.2 8.3 30.9 6.6 26 6.6 17.6 6.6 10.3 11.5 7.9 14.7z"/>
      <path fill="#4CAF50" d="M26 45.4c5.7 0 10.9-2.2 14.7-5.8l-6.8-5.6c-2 1.6-4.6 2.5-7.9 2.5-4.1 0-7.9-2.9-9.3-6.9l-6.6 5.1c2.5 4.9 7.6 10.7 15.9 10.7z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.4 4-5.2 6.9-9.3 6.9-5.7 0-10.3-4.6-10.3-10.3S20.3 14.3 26 14.3c2.6 0 5 .9 6.9 2.6l5.6-5.6C35.2 8.3 30.9 6.6 26 6.6 17.6 6.6 10.3 11.5 7.9 14.7z" opacity=".1"/>
    </svg>
  );
}
