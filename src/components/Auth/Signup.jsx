// src/components/Auth/Signup.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import { auth, googleProvider } from "../../firebase";

/** -----------------------------------------------------------------------
 * Password scoring (no dependency). Returns 0..4 and reasons.
 * 0-1 weak, 2 ok, 3 good, 4 strong
 * ---------------------------------------------------------------------- */
function scorePassword(pw) {
  const reasons = [];
  let score = 0;

  if (!pw) return { score: 0, reasons: ["Password is required"] };

  // length
  if (pw.length >= 12) score += 2;
  else if (pw.length >= 8) score += 1;
  else reasons.push("Use at least 8 characters");

  // classes
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasDigit = /\d/.test(pw);
  const hasSymbol = /[^A-Za-z0-9]/.test(pw);
  const classCount = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;

  if (classCount >= 3) score += 2;
  else if (classCount >= 2) score += 1;
  else reasons.push("Mix upper/lowercase, numbers, and symbols");

  // repetitiveness / trivial patterns
  if (/(.)\1{2,}/.test(pw)) reasons.push("Avoid repeated characters");
  if (/password|qwerty|letmein|12345/i.test(pw)) reasons.push("Avoid common passwords");

  // clamp 0..4
  score = Math.max(0, Math.min(4, score));
  return { score, reasons };
}

function strengthColor(score) {
  return ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#22c55e"][score];
}
function strengthLabel(score) {
  return ["Very weak", "Weak", "Fair", "Good", "Strong"][score];
}

/** Firebase error → friendly message */
function mapFirebaseError(codeOrMsg) {
  const code = String(codeOrMsg || "")
    .replace("Firebase: Error (", "")
    .replace(")", "");
  const table = {
    "auth/invalid-email": "That email looks malformed.",
    "auth/email-already-in-use": "An account already exists for this email.",
    "auth/operation-not-allowed": "Email/password sign-up is disabled for this project.",
    "auth/weak-password": "Password is too weak for Firebase policy.",
    "auth/network-request-failed": "Network error. Check your connection and try again.",
    "auth/popup-closed-by-user": "Google sign-in popup was closed before completing.",
    "auth/cancelled-popup-request": "Another sign-in is already in progress.",
  };
  return table[code] || codeOrMsg || "Unexpected error. Please try again.";
}

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [notice, setNotice] = useState("");

  const emailOk = /\S+@\S+\.\S+/.test(email.trim());
  const { score: pwScore, reasons: pwReasons } = useMemo(() => scorePassword(pw), [pw]);
  const canSubmit = emailOk && pwScore >= 2 && !busy; // require ≥ Fair

  const firstFieldRef = useRef(null);
  useEffect(() => { firstFieldRef.current?.focus?.(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setNotice("");
    if (!canSubmit) return;
    setBusy(true);
    try {
      const normalized = email.trim().toLowerCase();
      const cred = await createUserWithEmailAndPassword(auth, normalized, pw);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }

      // Optional email verification (skip if using emulators)
      const usingEmu = typeof import.meta !== "undefined" && import.meta.env?.VITE_USE_EMULATORS === "true";
      if (!usingEmu) {
        try {
          await sendEmailVerification(cred.user);
          setNotice("Verification email sent. You can explore now; some features may require verification.");
        } catch {
          /* non-fatal */
        }
      }

      // Navigate to the game
      nav("/game", { replace: true });
    } catch (e2) {
      setErr(mapFirebaseError(e2.code || e2.message));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async () => {
    setErr("");
    setNotice("");
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
      nav("/game", { replace: true });
    } catch (e2) {
      setErr(mapFirebaseError(e2.code || e2.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-gradient-to-b from-sky-100 to-white dark:from-slate-900 dark:to-slate-950 px-4">
      <form onSubmit={onSubmit} className="card w-[92%] max-w-sm p-6">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="text-sm opacity-70">Start raising your pixel pup.</p>

        <div className="mt-4 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm opacity-80">Display name (optional)</span>
            <input
              ref={firstFieldRef}
              className="input"
              placeholder="Bella's Human"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={busy}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm opacity-80">Email</span>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              required
              aria-invalid={!emailOk ? "true" : "false"}
            />
            {!emailOk && email.length > 3 && (
              <span className="text-xs text-rose-600">Enter a valid email.</span>
            )}
          </label>

          <label className="grid gap-1">
            <span className="text-sm opacity-80">Password</span>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="input pr-10"
                placeholder="At least 8 characters"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                disabled={busy}
                required
                aria-describedby="pw-help"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>

            {/* Strength bar */}
            <div className="mt-1">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full transition-[width] duration-200 rounded-full"
                  style={{
                    width: `${(pw ? Math.max(1, pwScore) : 0) * 25}%`,
                    background: strengthColor(pwScore),
                  }}
                  aria-hidden
                />
              </div>
              <div className="mt-1 text-xs opacity-70" id="pw-help">
                Strength: <b>{strengthLabel(pwScore)}</b>
              </div>
              {pw && pwScore < 3 && (
                <ul className="mt-1 text-xs text-rose-600 list-disc pl-5 space-y-0.5">
                  {pwReasons.map((r, i) => <li key={i}>{r}</li>)}
                </ul>
              )}
            </div>
          </label>
        </div>

        {/* Actions */}
        <div className="mt-4 grid gap-2">
          <button
            type="submit"
            className="btn btn-primary disabled:opacity-60"
            disabled={!canSubmit}
          >
            {busy ? "Creating…" : "Create account"}
          </button>

          <button
            type="button"
            className="btn"
            onClick={onGoogle}
            disabled={busy}
            title="Use your Google account"
          >
            Continue with Google
          </button>

          <div className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-sky-600">Log in</Link>
          </div>
        </div>

        {/* System status */}
        {notice && <div className="mt-3 text-xs text-emerald-600">{notice}</div>}
        {err && <div className="mt-2 text-xs text-rose-600">{err}</div>}

        {/* Legal (optional) */}
        <p className="mt-4 text-[11px] opacity-60">
          By creating an account, you agree to the <a href="#" className="underline">Terms</a> and <a href="#" className="underline">Privacy Policy</a>.
        </p>
      </form>
    </div>
  );
}
