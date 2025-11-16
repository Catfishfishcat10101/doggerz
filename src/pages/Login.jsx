// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PATHS } from "../routes.js";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase.js";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);

      // After login, check for existing dog document and route appropriately
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const ref = doc(db, "dogs", uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            nav(PATHS.GAME);
            return;
          }
        }
      } catch (innerErr) {
        // ignore and fall through to adopt
      }

      nav(PATHS.ADOPT);
    } catch (err) {
      setError(err.message || "Failed to sign in");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold text-center">Sign in to Doggerz</h1>

        <p className="text-sm text-zinc-400 text-center">
          Sign in with your email and password, or create an account if you
          don't have one yet.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-400 bg-red-950/20 p-2 rounded">{error}</div>
          )}

          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 font-semibold py-2.5 text-sm transition disabled:opacity-50"
          >
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-zinc-400 text-center">
          Need an account? {" "}
          <Link to={PATHS.SIGNUP} className="text-sky-400 hover:text-sky-300">
            Sign up
          </Link>
        </p>

        <p className="text-xs text-zinc-500 text-center">
          Once this shell feels right, we'll replace this form logic with
          real Firebase auth.
        </p>
      </div>
    </div>
  );
}
