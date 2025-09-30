import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import { userLoading, userAuthed, userError } from "@/redux/userSlice";

function shapeUser(u) {
  if (!u) return null;
  const { uid, email, displayName, photoURL } = u;
  return { uid, email, displayName, photoURL };
}

/** Client-side mirror of your Firebase password policy. */
function validatePassword(pw) {
  const errs = [];
  if (pw.length > 10) errs.push("≤ 10 characters");
  if (!/[A-Z]/.test(pw)) errs.push("at least one UPPERCASE letter");
  if (!/[^a-zA-Z0-9]/.test(pw)) errs.push("at least one symbol (e.g., ! @ # $ %)");
  return { ok: errs.length === 0, errs };
}

function friendlyAuthError(err) {
  const code = err?.code || "";
  // Map specific cases
  if (code === "auth/password-does-not-meet-requirements") {
    return "Password does not meet requirements (≤10 chars, include uppercase & a symbol).";
  }
  if (code === "auth/weak-password") return "Password too weak.";
  if (code === "auth/email-already-in-use") return "Email already in use.";
  if (code === "auth/popup-closed-by-user") return "Popup closed before completing sign-in.";
  if (code === "auth/cancelled-popup-request") return "Popup was interrupted. Try again.";
  if (code === "auth/popup-blocked") return "Popup blocked by the browser.";
  return err?.message || "Authentication failed.";
}

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState(null);
  const [pwErrs, setPwErrs] = useState([]);
  const dispatch = useDispatch();
  const nav = useNavigate();

  const policyText = useMemo(
    () => ["≤ 10 characters total", "include at least one UPPERCASE letter", "include at least one symbol (!@#$%)"],
    []
  );

  async function onEmailSignup(e) {
    e.preventDefault();
    setMsg(null);
    const { ok, errs } = validatePassword(pw);
    setPwErrs(errs);
    if (!ok) return;

    dispatch(userLoading());
    try {
      const { createUserWithEmailAndPassword, updateProfile } = await import("firebase/auth");
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);
      if (name.trim()) {
        await updateProfile(cred.user, { displayName: name.trim() });
      }
      const current = auth.currentUser;
      dispatch(userAuthed(shapeUser(current)));
      nav("/game", { replace: true });
    } catch (err) {
      console.error(err);
      const msg = friendlyAuthError(err);
      dispatch(userError(msg));
      setMsg(msg);
    }
  }

  async function onGoogle() {
    setMsg(null);
    dispatch(userLoading());
    try {
      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      // Try popup first (best UX)
      try {
        const { user } = await signInWithPopup(auth, provider);
        dispatch(userAuthed(shapeUser(user)));
        nav("/game", { replace: true });
        return;
      } catch (popupErr) {
        // If blocked or policy issues, fall back to redirect
        const code = popupErr?.code || "";
        if (
          code === "auth/popup-blocked" ||
          code === "auth/popup-closed-by-user" ||
          code === "auth/cancelled-popup-request"
        ) {
          await signInWithRedirect(auth, provider);
          return; // redirect will reload the app; result handled by your bootstrap/onAuthStateChanged
        }
        throw popupErr; // not a popup issue; surface error below
      }
    } catch (err) {
      console.error(err);
      const msg = friendlyAuthError(err);
      dispatch(userError(msg));
      setMsg(msg);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-3xl font-extrabold">Create your account</h1>
      <p className="mt-2 text-slate-300">Name your trainer and adopt your first pup.</p>

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
          <input
            type="password"
            className="mt-1 w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-amber-300"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="new-password"
            required
            // Don't set minLength client-side if policy allows shorter; let server own it.
          />
        </label>

        {/* Requirements always visible to reduce trial/error; not color-only */}
        <div className="text-xs text-slate-400">
          <div>Password must include:</div>
          <ul className="list-disc pl-5 space-y-1">
            {policyText.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        {/* Error surface (aria-live for screen readers; clear for everyone) */}
        {(msg || pwErrs.length > 0) && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-sm text-rose-200" aria-live="polite">
            {msg ? <div className="mb-1">{msg}</div> : null}
            {pwErrs.length > 0 && (
              <div>
                Fix: {pwErrs.join(", ")}.
              </div>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full mt-2 rounded-2xl bg-amber-400 text-slate-900 font-semibold px-4 py-2 hover:bg-amber-300"
        >
          Sign up
        </button>

        <button
          type="button"
          onClick={onGoogle}
          className="w-full rounded-2xl bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Continue with Google
        </button>

        <p className="text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-amber-300 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </main>
  );
}
