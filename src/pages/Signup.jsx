// src/pages/Signup.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { auth } from "@/lib/firebase.js";
import { userLoading, userAuthed, userError } from "@/redux/userSlice.js";
import { PATHS } from "@/config/routes.js";

export default function Signup() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const location = useLocation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const from = (location.state && location.state.from) || PATHS.GAME;

  // simple client-side validation
  const v = useMemo(() => {
    const errs = [];
    if (!name.trim()) errs.push("Display name is required.");
    if (!/^\S+@\S+\.\S+$/.test(email)) errs.push("Enter a valid email.");
    if (pw.length < 8) errs.push("Password must be at least 8 characters.");
    if (pw !== pw2) errs.push("Passwords don’t match.");
    return { ok: errs.length === 0, errs };
  }, [name, email, pw, pw2]);

  async function handleSignup(e) {
    e.preventDefault();
    setMsg(null);
    if (!v.ok) {
      setMsg(v.errs[0]);
      return;
    }
    setBusy(true);
    dispatch(userLoading());
    try {
      const {
        createUserWithEmailAndPassword,
        updateProfile,
        sendEmailVerification,
      } = await import("firebase/auth");

      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }

      // Optional but recommended: fire-and-forget email verification
      try {
        await sendEmailVerification(cred.user);
      } catch (_) {
        // non-fatal
      }

      dispatch(userAuthed(cred.user));
      nav(from, { replace: true });
    } catch (err) {
      const message = mapFirebaseError(err);
      setMsg(message);
      dispatch(userError(message));
    } finally {
      setBusy(false);
    }
  }

  const strength = useMemo(() => scorePassword(pw), [pw]);

  useEffect(() => {
    document.title = "Create account • Doggerz";
  }, []);

  return (
    <section className="mx-auto w-full max-w-md" aria-labelledby="signup-title">
      <h1 id="signup-title" className="text-3xl sm:text-4xl font-extrabold">
        Create your account
      </h1>
      <p className="mt-2 text-white/70">
        Save your pup’s progress across devices. Already have an account?{" "}
        <Link to={PATHS.LOGIN} className="underline underline-offset-4 hover:opacity-90">
          Sign in
        </Link>.
      </p>

      {/* Error banner */}
      {msg && (
        <div
          role="alert"
          className="mt-4 rounded-xl border border-red-500/30 bg-red-950/40 p-3 text-red-200"
        >
          {msg}
        </div>
      )}

      <form onSubmit={handleSignup} className="mt-6 space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-white/90">
            Display name
          </label>
          <input
            id="name"
            name="name"
            autoComplete="nickname"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl bg-zinc-900/70 px-3 py-2 text-white placeholder:text-white/40 ring-1 ring-inset ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Phoenix’s Dad"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-white/90">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl bg-zinc-900/70 px-3 py-2 text-white placeholder:text-white/40 ring-1 ring-inset ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="you@domain.com"
          />
        </div>

        <div>
          <label htmlFor="pw" className="block text-sm font-medium text-white/90">
            Password
          </label>
          <div className="mt-1 relative">
            <input
              id="pw"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="new-password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-xl bg-zinc-900/70 px-3 py-2 pr-24 text-white placeholder:text-white/40 ring-1 ring-inset ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="At least 8 characters"
              aria-describedby="pw-hint"
            />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-amber-400"
              aria-pressed={showPw}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>

          {/* strength meter uses text + bar (not color-only) */}
          <div id="pw-hint" className="mt-2">
            <div className="flex items-center gap-2 text-xs text-white/70">
              <span className="whitespace-nowrap">Strength:</span>
              <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
                <div
                  className="h-2 bg-amber-400"
                  style={{ width: `${strength.percent}%`, opacity: 0.9 }}
                  aria-hidden="true"
                />
              </div>
              <span className="font-medium">{strength.label}</span>
            </div>
            <p className="mt-1 text-xs text-white/50">
              Use 8+ chars, mix of letters and numbers. Avoid common words.
            </p>
          </div>
        </div>

        <div>
          <label htmlFor="pw2" className="block text-sm font-medium text-white/90">
            Confirm password
          </label>
          <input
            id="pw2"
            name="confirm"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            className="mt-1 w-full rounded-xl bg-zinc-900/70 px-3 py-2 text-white placeholder:text-white/40 ring-1 ring-inset ring-white/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Re-enter password"
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          className={`w-full rounded-2xl px-5 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 focus:ring-offset-slate-900 ${
            busy ? "bg-white/20 text-white/70 cursor-wait" : "bg-amber-400 text-slate-900 hover:bg-amber-300"
          }`}
          aria-busy={busy}
        >
          {busy ? "Creating account…" : "Create account"}
        </button>

        <p className="text-xs text-white/50">
          By continuing you agree to our{" "}
          <Link to="/terms" className="underline underline-offset-4 hover:opacity-90">Terms</Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline underline-offset-4 hover:opacity-90">Privacy</Link>.
        </p>
      </form>

      <div className="mt-6 text-sm text-white/70">
        Already have an account?{" "}
        <Link to={PATHS.LOGIN} className="underline underline-offset-4 hover:opacity-90">Sign in</Link>
      </div>
    </section>
  );
}

/* ---------------- helpers ---------------- */

function scorePassword(pw) {
  if (!pw) return { percent: 0, label: "Empty" };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[a-z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  const map = ["Weak", "Weak", "Fair", "Good", "Strong", "Strong"];
  return { percent: Math.min(100, (score / 5) * 100), label: map[score] };
}

function mapFirebaseError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "That email is already in use.";
    case "auth/invalid-email":
      return "Enter a valid email.";
    case "auth/weak-password":
      return "Password is too weak.";
    case "auth/network-request-failed":
      return "Network error. Check your connection.";
    default:
      return err?.message || "Could not create account.";
  }
}
