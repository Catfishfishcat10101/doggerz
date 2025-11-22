// src/pages/Landing.jsx
// Main landing / start screen for Doggerz

import { Link } from "react-router-dom";
import EnhancedDogSprite from "@/components/EnhancedDogSprite";

export default function Landing() {
  // later you can wire this from auth / Redux
  const isLoggedIn = false;

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-slate-50">
      {/* Hero container */}
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-10 md:flex-row md:items-center md:justify-between lg:gap-16">
        {/* LEFT: Logo, tagline, text, buttons */}
        <section className="flex-1 space-y-6">
          {/* Brand block */}
          <div>
            {/* Bigger Doggerz in upper left (within page content) */}
            <div className="inline-flex flex-col">
              <span className="text-4xl font-black tracking-tight text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">
                DOGGERZ
              </span>
              <span className="mt-1 text-sm font-medium uppercase tracking-[0.2em] text-zinc-400">
                virtual pup
              </span>
            </div>

            {/* Subtitle – not stretched full width */}
            <h1 className="mt-6 max-w-md text-balance text-2xl font-semibold leading-snug text-slate-100 md:text-3xl">
              Life doesn’t pause.  
              <span className="block text-amber-300">
                Your dog shouldn’t either.
              </span>
            </h1>

            <p className="mt-3 max-w-md text-sm text-zinc-400 md:text-base">
              Adopt a moody little pixel pup, keep up with real-time needs, and
              see how long you can keep your streak alive without ghosting your dog.
            </p>
          </div>

          {/* Primary actions – tight to the dog/hero, not full-screen spread */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Big primary CTA */}
            <Link
              to="/adopt"
              className="inline-flex items-center justify-center rounded-xl border border-amber-400 bg-amber-400 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-slate-950 shadow-lg shadow-amber-500/30 transition hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Adopt a pup
            </Link>

            {/* Larger login button */}
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-600 bg-zinc-900/70 px-5 py-3 text-sm font-semibold uppercase tracking-wide text-zinc-100 shadow-md shadow-black/40 transition hover:-translate-y-0.5 hover:border-amber-300 hover:text-amber-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Log in &nbsp;·&nbsp; Resume pup
            </Link>

            {/* Optional link-style action */}
            {isLoggedIn && (
              <Link
                to="/game"
                className="text-xs font-medium text-zinc-400 underline-offset-4 hover:text-amber-200 hover:underline"
              >
                Jump straight back into the yard
              </Link>
            )}
          </div>

          {/* Tiny helper text – doesn’t dominate the layout */}
          <p className="text-xs text-zinc-500">
            No fake timers, no idle clicker nonsense. Just your dog, ticking
            along in real time while you live your chaos.
          </p>
        </section>

        {/* RIGHT: Dog sprite showcase card */}
        <section className="flex-1">
          <div className="relative mx-auto flex max-w-sm items-center justify-center rounded-3xl border border-zinc-800 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 px-4 py-6 shadow-[0_18px_60px_rgba(0,0,0,0.7)]">
            {/* Glow ring behind dog */}
            <div className="pointer-events-none absolute inset-auto h-56 w-56 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="relative flex flex-col items-center gap-4">
              <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-slate-900/80 p-3 backdrop-blur">
                {/* Your actual sprite sheet component */}
                <div className="h-40 w-40 overflow-hidden">
                  <EnhancedDogSprite />
                </div>
              </div>

              {/* Little “status card” but minimal – we’ll move Hunger/etc to /game */}
              <div className="w-full rounded-2xl border border-zinc-800 bg-slate-900/70 px-4 py-3 text-xs text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-200">
                    Today’s vibe
                  </span>
                  <span className="text-[0.7rem] text-zinc-500">
                    Real-time pup sim
                  </span>
                </div>
                <p className="mt-1 text-[0.7rem] text-zinc-400">
                  Hunger, energy, cleanliness, and mood all tick in the
                  background. You’ll manage the full dashboard after you{" "}
                  <span className="text-amber-300">Adopt a pup</span>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer is handled by your layout – we’re leaving that as-is since you like it */}
    </main>
  );
}