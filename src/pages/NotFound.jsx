// src/pages/NotFound.jsx
<<<<<<< HEAD
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
=======
import { useNavigate } from "react-router-dom";
import { PATHS } from "@/routes.js";
import PageShell from "@/components/PageShell.jsx";

export default function NotFound() {
  const nav = useNavigate();

  return (
    <PageShell>
      <div className="min-h-[60vh] grid place-items-center">
        <div className="text-center rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-lg shadow-black/10 dark:border-white/10 dark:bg-black/20 dark:shadow-black/40">
          <h1 className="text-6xl font-extrabold text-zinc-900 dark:text-white">404</h1>
          <p className="mt-2 text-zinc-700 dark:text-white/70">This route doesn&apos;t exist.</p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={() => nav(PATHS.HOME)}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold"
            >
              Home
            </button>

            <button
              onClick={() => nav(-1)}
              className="px-4 py-2 rounded-lg border border-zinc-300 text-zinc-900 hover:bg-zinc-100 font-semibold dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-800"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </PageShell>
>>>>>>> master
  );
}
