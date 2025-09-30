<<<<<<< Updated upstream
import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function AuthGate({ children }) {
  const [status, setStatus] = useState("loading"); // loading | authed | anon
  const location = useLocation();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setStatus(u ? "authed" : "anon");
    });
    return unsub;
  }, []);

  if (status === "loading") {
    return <div className="p-6 text-sm opacity-70">Checking session…</div>;
  }
  if (status === "anon") {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return children;
}
=======
// src/components/Auth/AuthGate.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Your Firebase init must export `auth`
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  getRedirectResult,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

/**
 * AuthGate
 * - Shows login UI if signed-out
 * - Shows profile + sign-out if signed-in
 * - Uses redirect flow to avoid COOP popup-close issues
 * - Handles redirect result on mount
 */
export default function AuthGate() {
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState("");
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    let unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setBusy(false);
    });

    // Resolve any pending redirect sign-in
    getRedirectResult(auth).catch((e) => {
      // Don’t crash UI—just surface an error
      console.error("Auth redirect error:", e);
      setErr(e?.message || "Sign-in failed.");
    });

    return () => unsub && unsub();
  }, []);

  function nextPath() {
    // Bounce back to where user came from, default to /game
    const next = loc.state?.from?.pathname ?? "/game";
    return next;
  }

  async function loginGoogle() {
    try {
      setErr("");
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
      // After redirect returns, onAuthStateChanged will fire
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Could not start Google sign-in.");
    }
  }

  async function doLogout() {
    try {
      setErr("");
      await signOut(auth);
    } catch (e) {
      console.error(e);
      setErr(e?.message || "Sign-out failed.");
    }
  }

  if (busy) {
    return (
      <div className="min-h-dvh grid place-items-center bg-zinc-950 text-zinc-100">
        <div className="animate-pulse rounded-2xl border border-zinc-800 px-6 py-4">Checking auth…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-dvh grid place-items-center bg-zinc-950 text-zinc-100 p-6">
        <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <h1 className="text-2xl font-bold">Sign in</h1>
          {err ? <p className="text-sm text-red-400">{err}</p> : null}
          <button
            onClick={loginGoogle}
            className="w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-zinc-900 hover:bg-emerald-400 active:translate-y-px"
          >
            Continue with Google
          </button>
          <p className="text-xs text-zinc-400">
            By continuing, you agree to our terms. You can also play as guest and name your pup without an account.
          </p>
          <button
            onClick={() => nav("/new-pup", { replace: true })}
            className="w-full rounded-xl px-4 py-2 ring-1 ring-zinc-700 hover:bg-zinc-800"
          >
            Play as Guest
          </button>
        </div>
      </div>
    );
  }

  // Signed-in UI
  return (
    <div className="min-h-dvh grid place-items-center bg-zinc-950 text-zinc-100 p-6">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
        <h1 className="text-2xl font-bold">Welcome{user.displayName ? `, ${user.displayName}` : ""}.</h1>
        <div className="text-sm text-zinc-300 break-words">
          {user.email ? <div>Email: {user.email}</div> : null}
          <div>UID: <span className="font-mono text-xs">{user.uid}</span></div>
        </div>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
        <div className="flex gap-3">
          <button
            onClick={() => nav(nextPath(), { replace: true })}
            className="flex-1 rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-zinc-900 hover:bg-emerald-400 active:translate-y-px"
          >
            Continue
          </button>
          <button
            onClick={doLogout}
            className="rounded-xl px-4 py-2 ring-1 ring-zinc-700 hover:bg-zinc-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
>>>>>>> Stashed changes
