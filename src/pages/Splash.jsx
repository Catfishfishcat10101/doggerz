// src/pages/Splash.jsx
// Simple entry splash screen before the main landing

import { Link } from "react-router-dom";

export default function Splash() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-50">
      <div className="space-y-8 px-4 text-center">
        {/* Logo stack */}
        <div className="inline-flex flex-col items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-400">
            welcome to
          </span>
          <span className="text-5xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_30px_rgba(16,185,129,0.7)]">
            DOGGERZ
          </span>
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-emerald-300">
            virtual pup simulator
          </span>
        </div>

        {/* Short description */}
        <p className="mx-auto max-w-md text-sm text-zinc-400">
          A moody little dog that keeps living in real time while you deal with
          real life. Feed, clean, train, and try not to ghost your pup.
        </p>

        {/* Main actions */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl border border-emerald-400 bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Enter Doggerz
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-700 bg-zinc-900/80 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-zinc-100 shadow-md shadow-black/40 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            Log in
          </Link>
        </div>

        {/* Tiny dev helper link – safe to delete later */}
        <div className="text-[0.65rem] text-zinc-500">
          <span className="mr-1 align-middle">Dev shortcut:</span>
          <Link
            to="/game"
            className="align-middle underline-offset-4 hover:text-emerald-300 hover:underline"
          >
            go straight to the yard
          </Link>
        </div>
      </div>
    </main>
  );
}
