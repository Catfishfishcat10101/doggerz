// src/components/Auth/Signup.jsx
import React, { useMemo, useState } from "react";
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

/** Sensible client-side policy: min length + one uppercase + one symbol. */
function validatePassword(pw) {
  const errs = [];
  if (pw.length < 10) errs.push("at least 10 characters");
  if (!/[A-Z]/.test(pw)) errs.push("one UPPERCASE letter");
  if (!/[^a-zA-Z0-9]/.test(pw)) errs.push("one symbol (e.g., ! @ # $ %)");
  if (pw.length > 64) errs.push("no more than 64 characters");
  return { ok: errs.length === 0, errs };
}

function friendlyAuthError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account already exists for that email.";
    case "auth/invalid-email":
      return "That email address doesn’t look valid.";
    case "auth/weak-password":
      return "Password is too weak.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return err?.message || "Could not create your account.";
  }
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

  const policyText = useMemo(
    () => ["at least 10 characters", "one UPPERCASE letter", "one symbol (!@#$%)", "≤ 64 characters"],
    []
  );

  const hintedFrom = loc.state?.from;
  const fallback = nextRouteAfterAuth() || PATHS.GAME;

  async function onEmailSignup(e) {
    e.preventDefault();
    setMsg(null);

    const { ok, errs } = validatePassword(pw);
    if (!ok) {
      setMsg(`Password must include ${errs.join(", ")}.`);
      return;
    }

    dispatch(userLoading());
    setBusy(true);
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      const trimmed = name.trim();
      if (trimmed) await updateProfile(cred.user, { displayName: trimmed });

      dispatch(userAuthed(shapeUser(auth.currentUser)));
      const dest = hintedFrom || fallback;
      clearReturnTo();
      nav(dest, { replace: true });
    } catch (err) {
      const m = friendlyAuthError(err);
      dispatch(userError(m));
      setMsg(m);
      if (import.meta.env.DEV) console.warn("[signup]", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10" aria-labelledby="signup-title">
      <h1 id="signup-title" className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-2 text-slate-300">Name your trainer and adopt your first pup.</p>

      {msg && (
        <div role="alert" className="mt-4 rounded-xl border border-rose-500/30 bg-rose-950/40 p-3 text-rose-200">
          {msg}
        </div>
      )}

      <form onSubmit={onEmailSignup} className="mt-6 space-y-4" noValidate>
        <label className="block">
          <span className="text-sm text-slate-300">Display name</span>
          <input
            type="text"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="nickname"
            placeholder="PupMaster3000"
            maxLength={24}
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-300">Email</span>
          <input
            type="email"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
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
              className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300 pr-24"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
              aria-pressed={showPw}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        {/* Requirements: always visible, not color-only */}
        <div className="text-xs text-slate-400">
          <div>Password must include:</div>
          <ul className="list-disc pl-5 space-y-1">
            {policyText.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <button
          type="submit"
          disabled={busy}
          className={`w-full mt-2 rounded-2xl px-5 py-3 font-semibold
            ${busy ? "bg-white/20 text-white/70 cursor-wait" : "bg-amber-400 text-slate-900 hover:bg-amber-300"}`}
        >
          {busy ? "Creating…" : "Sign up"}
        </button>

        <p className="text-sm text-slate-400">
          Already have an account?{" "}
          <Link to={PATHS.LOGIN} className="text-amber-300 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
// End of src/components/Auth/Signup.jsx