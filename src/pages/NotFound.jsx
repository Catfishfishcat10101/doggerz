// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="rounded-2xl border border-emerald-400/10 bg-black/20 p-6">
        <h1 className="text-2xl font-bold text-emerald-200">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-400">
          That route doesn’t exist. Use the navigation or go back home.
        </p>

        <div className="mt-6 flex gap-3">
          <Link
            to="/"
            className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200 hover:border-emerald-400/60"
          >
            Go Home
          </Link>

          <Link
            to="/adopt"
            className="rounded-full border border-zinc-700 bg-zinc-900/30 px-4 py-2 text-sm text-zinc-200 hover:border-zinc-400"
          >
            Adopt
          </Link>
        </div>
      </div>
    </div>
  );
}
