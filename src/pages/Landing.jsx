// src/pages/Landing.jsx
// Main landing / start screen for Doggerz

import { Link } from "react-router-dom";
import EnhancedDogSprite from "@/components/EnhancedDogSprite";

export default function Landing() {
  // Later you can wire this to real auth / Redux
  const isLoggedIn = false;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
      {/* Hero container */}
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 md:flex-row md:items-center md:justify-between lg:gap-16">
        {/* LEFT: Logo, tagline, text, buttons */}
        <section className="flex-1 space-y-6">
          {/* Brand block */}
          <div>
            {/* Bigger Doggerz wordmark */}
            <div className="inline-flex flex-col">
              <span className="text-4xl font-black tracking-tight text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.55)]">
                DOGGERZ
              </span>
              <span className="mt-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                virtual pup
              </span>
            </div>

            {/* Simple, non-stretched heading */}
            <h1 className="mt-6 max-w-md text-2xl font-semibold leading-snug text-slate-100 md:text-3xl">
              Adopt your pup and keep them going in real time.
            </h1>
          </div>

          {/* Primary actions – close to the dog area */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Big primary CTA */}
            <Link
              to="/adopt"
              className="inline-flex items-center justify-center rounded-xl border border-emerald-400 bg-emerald-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Adopt a pup
            </Link>

            {/* Larger login button */}
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-900/70 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-zinc-100 shadow-md shadow-black/40 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Log in · Resume pup
            </Link>

            {/* Later you can show this only when real auth says “logged in” */}
            {isLoggedIn && (
              <Link
                to="/game"
                className="text-xs font-medium text-zinc-400 underline-offset-4 hover:text-emerald-200 hover:underline"
              >
                Jump back into the yard
              </Link>
            )}
          </div>

          {/* Tiny helper text – clarifies flow without being loud */}
          <p className="max-w-md text-xs text-zinc-500">
            The full dashboard (hunger, energy, cleanliness, potty training,
            etc.) unlocks on the next screen after you adopt or log in.
          </p>
        </section>

        {/* RIGHT: Dog sprite showcase card */}
        <section className="flex-1">
          <div className="relative mx-auto flex max-w-sm items-center justify-center rounded-3xl border border-zinc-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
            {/* Glow ring behind dog */}
            <div className="pointer-events-none absolute inset-auto h-56 w-56 rounded-full bg-emerald-400/12 blur-3xl" />

            <div className="relative flex flex-col items-center gap-4">
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-slate-900/80 p-3 backdrop-blur">
                {/* Your actual sprite sheet component */}
                <div className="h-40 w-40 overflow-hidden">
                  <EnhancedDogSprite />
                </div>
              </div>

              {/* Minimal status text - no big meters here */}
              <div className="w-full rounded-2xl border border-zinc-800 bg-slate-900/70 px-4 py-3 text-xs text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-200">
                    Your virtual pup
                  </span>
                  <span className="text-[0.7rem] text-zinc-500">
                    Real-time sim
                  </span>
                </div>
                <p className="mt-1 text-[0.7rem] text-zinc-400">
                  Needs tick in the background while you’re away. You’ll see the
                  full stats once you’re inside the game.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Header + footer are already handled somewhere else in your app. */}
    </main>
  );
}
