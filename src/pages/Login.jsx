// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const from = loc.state?.from?.pathname || "/game";

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onEmailLogin(e) {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      nav(from, { replace: true });
    } catch (e2) {
      setErr(e2?.message || "Login failed");
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
      <h1 className="text-3xl font-extrabold">Log in</h1>
      <p className="opacity-80 mt-1">Sign in to play and save your pup.</p>

      <form onSubmit={onEmailLogin} className="mt-6 space-y-3">
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
          {loading ? "Signing in…" : "Log in"}
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
        No account?{" "}
        <Link to="/signup" className="text-amber-300 hover:underline">Create one</Link>
      </div>
    </div>
  );
}
