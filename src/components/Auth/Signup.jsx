// src/components/Auth/Signup.jsx
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

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const dispatch = useDispatch();
  const nav = useNavigate();
  const loc = useLocation();

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
    if (import.meta.env.DEV) console.warn("[signup]", err);
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

  async function onEmailSignup(e) {
    e.preventDefault();
    const eTrim = email.trim().toLowerCase();
    const nTrim = name.trim();
    if (!eTrim || pw.length < 6) {
      setMsg("Use a valid email and a password of at least 6 characters.");
      return;
    }
    await withBusy(async () => {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const cred = await createUserWithEmailAndPassword(auth, eTrim, pw);
      if (nTrim) {
        await updateProfile(cred.user, { displayName: nTrim });
        await auth.currentUser?.reload();
      }
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
        if (err?.code === "auth/popup-blocked" || err?.code === "auth/popup-closed-by-user") {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw err;
      }
    });
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10" aria-labelledby="signup-title">
      <h1 id="signup-title" className="text-3xl font-extrabold">Create account</h1>
      <p className="mt-2 text-slate-300">
        Already have an account?{" "}
        <Link to={PATHS.LOGIN} className="text-amber-300 hover:underline">Log in</Link>.
      </p>

      {msg && (
        <div role="alert" className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-rose-200">
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

      <form onSubmit={onEmailSignup} className="mt-5 space-y-4" noValidate>
        <label className="block">
          <span className="text-sm text-slate-300">Display name</span>
          <input
            type="text"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2
                       outline-none focus:ring-2 focus:ring-amber-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            placeholder="Optional"
            autoComplete="nickname"
          />
        </label>

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
              autoComplete="new-password"
              required
              minLength={6}
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

        <button
          type="submit"
          disabled={busy}
          className={`rounded-2xl px-5 py-3 font-semibold
            ${busy ? "bg-white/20 text-white/70 cursor-wait" : "bg-amber-400 text-slate-900 hover:bg-amber-300"}`}
        >
          {busy ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-400">
        By creating an account you agree to our{" "}
        <Link to={PATHS.TERMS} className="text-amber-300 hover:underline">Terms</Link> and{" "}
        <Link to={PATHS.PRIVACY} className="text-amber-300 hover:underline">Privacy Policy</Link>.
      </p>
    </main>
  );
}

function mapFirebaseError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists for that email.";
    case "auth/invalid-email":
      return "That email address doesn’t look valid.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/popup-blocked":
      return "Popup was blocked — trying redirect…";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return err?.message || "Could not create account.";
  }
}
