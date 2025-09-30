// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { auth } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default function Signup() {
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/game";

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onEmailSignup(e) {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (name) {
        await updateProfile(cred.user, { displayName: name });
      }
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    setLoading(true); setErr("");
    try {
      const prov = new GoogleAuthProvider();
      await signInWithPopup(auth, prov);
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-3xl font-extrabold">Create account</h1>
      <p className="opacity-80 mt-1">We’ll save your pup to your account.</p>

      <form onSubmit={onEmailSignup} className="mt-6 space-y-3">
        <input
          type="text" placeholder="Display name (optional)"
          value={name} onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bg-white/10 px-3 py-2"
        />
        <input
          type="email" required placeholder="Email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl bg-white/10 px-3 py-2"
        />
        <input
          type="password" required placeholder="Password"
          value={pass} onChange={(e) => setPass(e.target.value)}
          className="w-full rounded-xl bg-white/10 px-3 py-2"
        />
        {err && <div className="text-sm text-rose-300">{err}</div>}
        <button disabled={loading} className="w-full rounded-xl bg-amber-400/90 text-slate-900 font-semibold px-4 py-2">
          {loading ? "Creating…" : "Sign up"}
        </button>
      </form>

      <div className="my-4 text-center text-sm opacity-70">or</div>

      <button
        type="button" onClick={onGoogle} disabled={loading}
        className="w-full rounded-xl bg-white/15 hover:bg-white/25 px-4 py-2"
      >
        Continue with Google
      </button>

      <div className="mt-4 text-sm">
        Have an account?{" "}
        <Link to="/login" className="text-amber-300 hover:underline">Log in</Link>
      </div>
    </div>
  );
}
