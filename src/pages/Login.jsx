// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate, useNavigate, Link, useLocation } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";

import { auth, firebaseReady } from "@/lib/firebase/index.js";
import { PATHS } from "@/app/routes.js";
import { selectIsLoggedIn } from "@/store/userSlice.js";
import {
  getStoredValue,
  removeStoredValues,
  setStoredValue,
} from "@/utils/nativeStorage.js";

import PageShell from "@/components/layout/PageShell.jsx";

const STORAGE_REMEMBER = "doggerz:loginRememberEmail";
const STORAGE_EMAIL = "doggerz:loginEmail";
const EXPECTED_SIGN_IN_ERROR_CODES = new Set([
  "auth/invalid-credential",
  "auth/invalid-login-credentials",
  "auth/user-not-found",
  "auth/wrong-password",
  "auth/too-many-requests",
]);

async function loadRememberedEmail() {
  try {
    const remember = (await getStoredValue(STORAGE_REMEMBER)) === "1";
    const email = remember ? (await getStoredValue(STORAGE_EMAIL)) || "" : "";
    return { remember, email };
  } catch {
    return { remember: false, email: "" };
  }
}

async function persistRememberedEmail({ remember, email }) {
  try {
    if (remember) {
      await Promise.all([
        setStoredValue(STORAGE_REMEMBER, "1"),
        setStoredValue(STORAGE_EMAIL, String(email || "")),
      ]);
      return;
    }
    await removeStoredValues([STORAGE_REMEMBER, STORAGE_EMAIL]);
  } catch {
    // ignore
  }
}

export default function LoginPage() {
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || "/game";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSending, setResetSending] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetState, setResetState] = useState("idle");
  const [storageHydrated, setStorageHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadRememberedEmail().then((remembered) => {
      if (cancelled) return;
      setRememberEmail(Boolean(remembered.remember));
      setEmail(String(remembered.email || ""));
      setStorageHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!storageHydrated) return;
    persistRememberedEmail({ remember: rememberEmail, email });
  }, [rememberEmail, email, storageHydrated]);

  if (isLoggedIn) {
    return <Navigate to={from} replace />;
  }

  const handleContinueOffline = () => {
    navigate(PATHS.GAME, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setResetState("idle");

    if (!firebaseReady || !auth) {
      setError(
        "Firebase is not configured. Add your VITE_FIREBASE_* keys to .env.local to enable login, or continue in offline mode."
      );
      return;
    }

    if (!email.trim() || !password) {
      setError("Email and password are both required.");
      return;
    }

    try {
      setSubmitting(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
      persistRememberedEmail({ remember: rememberEmail, email });
      navigate(from, { replace: true });
    } catch (err) {
      if (!EXPECTED_SIGN_IN_ERROR_CODES.has(err?.code)) {
        console.error("[Login] signIn error:", err);
      }
      let message = "Login failed. Double-check your email and password.";

      if (err.code === "auth/user-not-found") {
        message = "No account found for that email.";
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password.";
      } else if (
        err?.code === "auth/invalid-credential" ||
        err?.code === "auth/invalid-login-credentials"
      ) {
        message =
          "No matching account found for that email and password. Use Forgot password, sign up, or continue in local-only mode.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many attempts. Wait a bit, then try again.";
      }

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setNotice(null);
    setResetState("idle");

    if (!firebaseReady || !auth) {
      setResetState("error");
      setError(
        "Password reset requires cloud login. Add your Firebase config to .env.local, or continue in offline mode."
      );
      return;
    }

    const cleanEmail = String(email || "").trim();
    if (!cleanEmail) {
      setResetState("error");
      setError("Enter your email first, then click Forgot password.");
      return;
    }

    try {
      setResetSending(true);
      setResetState("sending");
      await sendPasswordResetEmail(auth, cleanEmail);
      setResetState("sent");
      setNotice(
        "If an account exists for that email, a password reset link has been sent."
      );
    } catch (err) {
      console.error("[Login] password reset error:", err);
      let message =
        "Could not send a reset email. Double-check your address and try again.";
      let useNotice = false;

      if (err?.code === "auth/invalid-email") {
        message = "That email address does not look valid.";
      } else if (err?.code === "auth/too-many-requests") {
        message = "Too many requests. Please wait a bit and try again.";
      } else if (err?.code === "auth/user-not-found") {
        message =
          "If an account exists for that email, a password reset link has been sent.";
        useNotice = true;
      }

      if (useNotice) {
        setResetState("sent");
        setNotice(message);
      } else {
        setResetState("error");
        setError(message);
      }
    } finally {
      setResetSending(false);
    }
  };

  return (
    <PageShell
      title="Log in"
      subtitle="Sign in to keep your pup synced and unlock cloud features. Prefer staying local? You can still continue without an account."
      headerAlign="center"
    >
      <div className="flex flex-col items-center w-full h-full pt-2 pb-10">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/80 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/70">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Welcome back
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Continue your pup&apos;s story.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!firebaseReady && (
              <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                <p className="font-medium">
                  Cloud login is currently disabled.
                </p>
                <p className="mt-1 text-amber-200/80">
                  To enable it, set your Firebase web config in{" "}
                  <code>.env.local</code> (see <code>.env.example</code>). Until
                  then, you can still play in local-only mode.
                </p>
              </div>
            )}

            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                inputMode="email"
                autoCapitalize="none"
                autoCorrect="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white border border-zinc-300 text-zinc-900 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm dark:bg-zinc-950 dark:border-zinc-700 dark:text-white dark:placeholder:text-zinc-500"
                  autoComplete="current-password"
                  placeholder="password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[10px] font-semibold text-zinc-100 hover:bg-black/30 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={rememberEmail}
                    onChange={(e) => setRememberEmail(e.target.checked)}
                  />
                  Remember email
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={resetSending}
                  className="font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-60"
                  aria-busy={resetSending}
                >
                  {resetSending ? "Sending reset link..." : "Forgot password?"}
                </button>
              </div>
              <p className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
                {resetState === "sending"
                  ? "Working on it. Sending your reset link now."
                  : "Enter your email above and we will send a reset link if there is an account for it."}
              </p>
            </div>

            {notice && (
              <p className="text-xs text-emerald-300 mt-1" aria-live="polite">
                {notice}
              </p>
            )}

            {error && (
              <p className="text-xs text-red-400 mt-1" aria-live="assertive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting || !firebaseReady}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-sm font-semibold shadow-lg"
            >
              {submitting ? "Logging in..." : "Log in"}
            </button>

            <button
              type="button"
              onClick={handleContinueOffline}
              className="w-full py-2.5 rounded-xl border border-white/10 bg-black/20 text-sm font-semibold text-zinc-100 hover:bg-black/30 transition"
            >
              Continue in local-only mode
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-zinc-600 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <Link
              to={PATHS.SIGNUP}
              className="text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
