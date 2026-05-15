// src/pages/Signup.jsx

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

import { PATHS } from "@/app/routes.js";
import PageShell from "@/components/layout/PageShell.jsx";
import { auth, firebaseReady } from "@/lib/firebase/index.js";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!firebaseReady || !auth) {
      setError(
        "Cloud signup is not available in this build. You can still play in local-only mode."
      );
      return;
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      setSubmitting(true);
      const cred = await createUserWithEmailAndPassword(
        auth,
        trimmedEmail,
        password
      );

      const name = String(displayName || "").trim();
      if (name) {
        try {
          await updateProfile(cred.user, { displayName: name });
        } catch (e2) {
          console.warn("[Signup] updateProfile failed", e2);
        }
      }

      navigate(PATHS.ADOPT, { replace: true });
    } catch (err) {
      console.error("[Signup] signup error:", err);
      let message = "Signup failed. Please try again.";
      if (err?.code === "auth/email-already-in-use") {
        message = "That email is already in use. Try logging in instead.";
      } else if (err?.code === "auth/invalid-email") {
        message = "That email address does not look valid.";
      } else if (err?.code === "auth/weak-password") {
        message = "Password is too weak. Try at least 6 characters.";
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageShell useSurface={false}>
      <div className="flex min-h-[70dvh] items-center px-4 pb-10">
        <div className="container mx-auto max-w-md">
          <div className="mb-6">
            <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300/80">
              Doggerz account
            </div>
            <h1 className="mt-2 text-3xl font-black text-zinc-100">
              Create your account
            </h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Sync your dog, care history, and progress across devices when
              cloud save is available.
            </p>
          </div>

          {!firebaseReady ? (
            <div className="mb-4 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
              <p className="font-bold">Cloud signup is currently disabled.</p>
              <p className="mt-1 text-amber-200/80">
                You can still adopt a dog and play in local-only mode on this
                device.
              </p>
              <button
                type="button"
                onClick={() => navigate(PATHS.ADOPT, { replace: true })}
                className="mt-3 inline-flex min-h-10 items-center justify-center rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-black hover:bg-amber-300"
              >
                Continue offline
              </button>
            </div>
          ) : null}

          <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(9,19,34,0.92),rgba(3,8,16,0.94))] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="space-y-2">
              <label
                htmlFor="displayName"
                className="block text-sm font-bold text-zinc-200"
              >
                Display name
              </label>
              <input
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={32}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15"
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-bold text-zinc-200"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-bold text-zinc-200"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-12 w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 text-sm text-white placeholder:text-zinc-500 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/15"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !firebaseReady}
              className="min-h-12 w-full rounded-2xl bg-emerald-400 py-3 text-sm font-black text-black shadow-[0_12px_30px_rgba(52,211,153,0.18)] transition hover:bg-emerald-300 disabled:bg-white/12 disabled:text-zinc-400 disabled:shadow-none"
            >
              {submitting ? "Creating account..." : "Sign up"}
            </button>

            <button
              type="button"
              onClick={() => navigate(PATHS.ADOPT, { replace: true })}
              className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/8 px-3 py-3 text-sm font-bold text-zinc-100 transition hover:bg-white/12"
            >
              Continue offline
            </button>

            {error ? <p className="text-xs text-red-400">{error}</p> : null}

            <p className="text-center text-xs text-zinc-400">
              Already have an account?{" "}
              <Link
                to={PATHS.LOGIN}
                className="font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Log in
              </Link>
              .
            </p>
          </form>
        </div>
      </div>
    </PageShell>
  );
}
