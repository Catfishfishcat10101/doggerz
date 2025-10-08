// src/components/Auth/GoogleButton.jsx
import React, { useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
} from "firebase/auth";

/**
 * GoogleButton
 * Props:
 *  - onSuccess?: (user) => void
 *  - className?: string
 *  - children?: ReactNode (override default label)
 */
export default function GoogleButton({ onSuccess, className = "", children }) {
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  async function login() {
    if (busy) return;
    setErr(null);
    setBusy(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    try {
      // Try popup first for best UX.
      const cred = await signInWithPopup(auth, provider);
      if (typeof onSuccess === "function") onSuccess(cred.user);
    } catch (e) {
      // Known popup issues? Fall back to redirect.
      const code = e?.code || "";
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request"
      ) {
        try {
          await signInWithRedirect(auth, provider); // page will navigate; result handled by your AuthListener
          return;
        } catch (e2) {
          setErr(mapError(e2));
          if (import.meta.env.DEV) console.warn("[google redirect]", e2);
        }
      } else {
        setErr(mapError(e));
        if (import.meta.env.DEV) console.warn("[google popup]", e);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2" aria-live="polite">
      <button
        type="button"
        onClick={login}
        disabled={busy}
        className={`w-full rounded-xl px-4 py-2 font-semibold
          ${busy ? "bg-white/20 text-white/70 cursor-wait" : "bg-white text-slate-900 hover:opacity-90"} ${className}`}
        aria-disabled={busy ? "true" : "false"}
      >
        {busy ? "Connecting…" : (children || "Continue with Google")}
      </button>

      {err && (
        <div
          role="alert"
          className="text-sm text-rose-200 bg-rose-950/40 border border-rose-500/30 rounded-lg px-3 py-2"
        >
          {err}
        </div>
      )}
    </div>
  );
}

function mapError(err) {
  const code = err?.code || "";
  switch (code) {
    case "auth/unauthorized-domain":
      return "This domain isn’t authorized for Google sign-in. Add it in Firebase → Auth → Settings → Authorized domains.";
    case "auth/account-exists-with-different-credential":
      return "An account with the same email exists with a different sign-in method.";
    case "auth/popup-blocked":
      return "Popup was blocked—trying a redirect…";
    case "auth/popup-closed-by-user":
      return "Popup closed before completing sign-in.";
    case "auth/cancelled-popup-request":
      return "Another sign-in attempt was already in progress.";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    default:
      return err?.message || "Google sign-in failed.";
  }
}
