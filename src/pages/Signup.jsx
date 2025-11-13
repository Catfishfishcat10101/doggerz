// src/pages/Signup.jsx
import React from "react";
import { Link } from "react-router-dom";
import { PATHS } from "@/routes.js";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-md mx-auto px-4 space-y-6">
        <h1 className="text-3xl font-bold text-center">Create your Doggerz account</h1>

        <p className="text-sm text-zinc-400 text-center">
          Placeholder only. We&apos;ll wire this into Firebase email/password +
          Google auth later.
        </p>

        <form className="space-y-4">
          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Email</label>
            <input
              type="email"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="you@example.com"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Password</label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <div className="space-y-1 text-left">
            <label className="text-sm text-zinc-300">Confirm password</label>
            <input
              type="password"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm outline-none focus:border-emerald-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-lg bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-semibold py-2.5 text-sm transition"
          >
            Sign up (demo only)
          </button>
        </form>

        <p className="text-xs text-zinc-400 text-center">
          Already have an account?{" "}
          <Link
            to={PATHS.LOGIN}
            className="text-emerald-400 hover:text-emerald-300"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
