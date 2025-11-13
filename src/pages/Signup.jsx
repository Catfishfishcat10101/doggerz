// src/pages/Signup.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold text-center">Create your account</h1>

        <p className="text-sm text-zinc-400 text-center">
          This is a placeholder sign-up screen. We&apos;ll wire it into Firebase
          next.
        </p>

        <form className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="button"
            className="w-full rounded-lg bg-sky-500 hover:bg-sky-400 text-zinc-950 font-semibold py-2.5 text-sm transition"
          >
            Create account (demo)
          </button>
        </form>

        <p className="text-xs text-zinc-400 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-400 hover:text-sky-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}