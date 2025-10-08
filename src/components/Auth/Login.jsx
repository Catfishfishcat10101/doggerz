// src/components/Auth/Login.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { userLoading, userAuthed, userError } from "@/redux/userSlice";
import { nextRouteAfterAuth, clearReturnTo } from "@/utils/nextRouteAfterAuth.js";
import { PATHS } from "@/config/routes.js";

function shapeUser(u) {
  if (!u) return null;
  const { uid, email, displayName, photoURL } = u;
  return { uid, email, displayName, photoURL };
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const dispatch = useDispatch();
  const nav = useNavigate();
  const loc = useLocation();

  // If a guard put us here with state.from, honor it; otherwise compute via helper.
  const hintedFrom = loc.state?.from;
  const fallbackFrom = nextRouteAfterAuth() || PATHS.GAME;

  async function resolveAndGo() {
    const dest = hintedFrom || fallbackFrom;
    clearReturnTo();
    nav(dest, { replace: true });
  }

  function setError(err) {
    const message = mapFirebaseError(err);
    setMsg(message);
    dispatch(userError(message));
    // surface details in dev
    if (import.meta.env.DEV) console.warn("[login]", err);
  }

  async function withBusy(fn) {
    if (busy) return;
    setMsg(null);
    setBusy(true);
    dispatch(userLoading());
    try {
      await fn();
      dispatch(userAuthed(shapeUser(auth.currentUser)));
      await resolveAndGo();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function onEmailLogin(e) {
    e.preventDefault();
    const eTrim = email.trim();
    if (!eTrim || pw.length < 1) return;
    await withBusy(async () => {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      await signInWithEmailAndPassword(auth, eTrim, pw);
    });
  }

  async function onGoogle() {
    await withBusy(async () => {
      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      try {
        await signInWithPopup(auth, provider);
      } catch (err) {
        // Popup blockers or iOS WKWebView often need redirects
        if (err?.code === "auth/popup-blocked" || err?.code === "auth/popup-closed-by-user") {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw err;
      }
    });
  }

  async function onForgot(e) {
    e.preventDefault();
    const eTrim = email.trim();
    if (!eTrim) { setMsg("Enter your email first to receive a reset link."); return; }
    await withBusy(async () => {
      const { sendPasswordResetEmail } = await import("firebase/auth");
      await sendPasswordResetEmail(auth, eTrim);
      setMsg("Password reset email sent. Check your inbox.");
    });
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10" aria-labelledby="login-title">
      <h1 id="login-title" className="text-3xl font-extrabold">Log in</h1>
      <p className="mt-2 text-slate-300">
        Welcome back. Don’t have an account?{" "}
        <Link to={PATHS.SIGNUP} className="text-amber-300 hover:underline">Create one</Link>.
      </p>

      {msg && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-rose-200"
        >
          {msg}
        </div>
      )}

      <div className="mt-5 grid gap-3">
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className={`w-full rounded-2xl px-4 py-2 font-semibold
            ${busy ? "bg-white/20 text-white/70 cursor-wait" : "bg-white text-slate-900 hover:opacity-90"}`}
          aria-disabled={busy ? "true" : "false"}
        >
          Continue with Google
        </button>
      </div>

      <form onSubmit={onEmailLogin} className="mt-5 space-y-4" noValidate>
        <label className="block">
          <span className="text-sm text-slate-300">Email</span>
          <input
            type="email"
            inputMode="email"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2
                       outline-none focus:ring-2 focus:ring-amber-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Password</span>
          <div className="mt-1 relative">
            <input
              type={showPw ? "text" : "password"}
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2
                         outline-none focus:ring-2 focus:ring-amber-300 pr-24"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg
                         bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
              aria-pressed={showPw}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={busy}
            className={`rounded-2xl px-5 py-3 font-semibold
              ${busy ? "bg-white/20 text-white/70 cursor-wait" : "bg-amber-400 text-slate-900 hover:bg-amber-300"}`}
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>

          <button
            type="button"
            onClick={onForgot}
            className="text-sm text-slate-300 hover:text-white underline underline-offset-4"
          >
            Forgot password?
          </button>
        </div>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        New here?{" "}
        <Link to={PATHS.SIGNUP} className="text-amber-300 hover:underline">Create an account</Link>
      </p>
    </main>
  );
}

function mapFirebaseError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain isn’t authorized for OAuth. Add it in Firebase → Auth → Settings → Authorized domains.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "Invalid email or password.";
    case "auth/user-not-found":
      return "No account found for that email.";
    case "auth/wrong-password":
      return "Incorrect password.";
    case "auth/popup-blocked":
      return "Popup was blocked — trying redirect…";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return err?.message || "Could not sign in.";
  }
}
