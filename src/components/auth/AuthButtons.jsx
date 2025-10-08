// src/components/Auth/AuthButtons.jsx
import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";

/**
 * AuthButtons
 * Props:
 *  - mode: "login" | "signup"  (default: "login")
 *  - onSuccess?: (user) => void
 *  - showForgot?: boolean       (login-only; default true)
 */
export default function AuthButtons({ mode = "login", onSuccess, showForgot = true }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const isLogin = mode === "login";

  const setError = (err) => {
    const text = mapError(err);
    setMsg(text);
    if (import.meta.env?.DEV) console.warn("[auth]", err);
  };

  const finish = (user) => {
    setMsg(null);
    if (typeof onSuccess === "function") onSuccess(user);
  };

  async function withBusy(fn) {
    if (busy) return;
    setMsg(null);
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }

  // --- Actions ---------------------------------------------------------------
  async function onGoogle() {
    await withBusy(async () => {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try {
        const cred = await signInWithPopup(auth, provider);
        finish(cred.user);
      } catch (err) {
        // Fallback for popup-blocked environments
        if (err?.code === "auth/popup-blocked" || err?.code === "auth/popup-closed-by-user") {
          await signInWithRedirect(auth, provider);
          return;
        }
        setError(err);
      }
    });
  }

  async function onEmailLogin(e) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!em || !pw) return;
    await withBusy(async () => {
      try {
        const { user } = await signInWithEmailAndPassword(auth, em, pw);
        finish(user);
      } catch (err) {
        setError(err);
      }
    });
  }

  async function onEmailSignup(e) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    const nm = name.trim();
    if (!em || !pw) return;
    await withBusy(async () => {
      try {
        const { user } = await createUserWithEmailAndPassword(auth, em, pw);
        if (nm) await updateProfile(user, { displayName: nm });
        finish(user);
      } catch (err) {
        setError(err);
      }
    });
  }

  async function onForgot(e) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    if (!em) {
      setMsg("Enter your email first to receive a reset link.");
      return;
    }
    await withBusy(async () => {
      try {
        await sendPasswordResetEmail(auth, em);
        setMsg("Password reset email sent. Check your inbox.");
      } catch (err) {
        setError(err);
      }
    });
  }

  // --- UI --------------------------------------------------------------------
  return (
    <div className="space-y-4" id="auth-panel" aria-live="polite">
      {isLogin && (
        <button
          type="button"
          onClick={onGoogle}
          disabled={busy}
          className={`w-full rounded-xl px-4 py-2 font-semibold
            ${busy ? "bg-white/20 text-white/70 cursor-wait" : "bg-neutral-200 text-neutral-900 hover:bg-white"}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white`}
          aria-disabled={busy ? "true" : "false"}
        >
          Continue with Google
        </button>
      )}

      <form className="grid gap-3" onSubmit={isLogin ? onEmailLogin : onEmailSignup} noValidate>
        {!isLogin && (
          <input
            className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-300"
            placeholder="Display name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="nickname"
          />
        )}

        <input
          className="rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-300"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
        />

        <div className="relative">
          <input
            className="w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-amber-300 pr-24"
            type={showPw ? "text" : "password"}
            placeholder="Password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />
          <button
            type="button"
            onClick={() => setShowPw((s) => !s)}
            className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
            aria-pressed={showPw}
          >
            {showPw ? "Hide" : "Show"}
          </button>
        </div>

        {isLogin ? (
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={busy}
              className={`flex-1 rounded-xl px-4 py-2 font-semibold mr-2
                ${busy ? "bg-white/20 text-white/70 cursor-wait" : "bg-amber-400 text-slate-900 hover:bg-amber-300"}`}
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
            {showForgot && (
              <button
                type="button"
                onClick={onForgot}
                className="text-sm text-slate-300 hover:text-white underline underline-offset-4"
              >
                Forgot password?
              </button>
            )}
          </div>
        ) : (
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className={`flex-1 rounded-xl px-4 py-2 font-semibold
                ${busy ? "bg-white/20 text-white/70 cursor-wait" : "bg-amber-400 text-slate-900 hover:bg-amber-300"}`}
            >
              {busy ? "Creating…" : "Create account"}
            </button>
          </div>
        )}
      </form>

      {msg && (
        <p role="alert" className="text-sm text-rose-200 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2">
          {msg}
        </p>
      )}
    </div>
  );
}

function mapError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain isn’t authorized for OAuth. Add it in Firebase → Auth → Settings → Authorized domains.";
    case "auth/email-already-in-use":
      return "An account already exists for that email.";
    case "auth/invalid-email":
      return "That email address doesn’t look valid.";
    case "auth/weak-password":
      return "Password is too weak.";
    case "auth/user-not-found":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
      return "Invalid email or password.";
    case "auth/popup-blocked":
      return "Popup blocked. We’ll try a redirect instead.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return err?.message || "Something went wrong.";
  }
}
