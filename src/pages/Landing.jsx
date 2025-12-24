// src/pages/Landing.jsx
// Doggerz – Virtual Pup Adoption Homepage

import * as React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
        {/* HEADER */}
        <header className="mb-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-2xl font-black leading-none tracking-tight">
              D
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-emerald-400">
                DOGGERZ
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                Virtual Jack Russell Pup
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm md:flex">
            <Link
              to="/game"
              className="text-zinc-400 transition-colors hover:text-emerald-400"
            >
              Game
            </Link>
            <Link
              to="/adopt"
              className="text-zinc-400 transition-colors hover:text-emerald-400"
            >
              Adopt
            </Link>
            <Link
              to="/about"
              className="text-zinc-500 transition-colors hover:text-zinc-200"
            >
              About
            </Link>
          </nav>

          <Link
            to="/adopt"
            className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300 hover:bg-emerald-500/20"
          >
            Start Game
          </Link>
        </header>

        {/* HERO SECTION */}
        <section className="grid items-center gap-10 md:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Left: copy */}
          <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
              VIRTUAL PUP · ALWAYS BY YOUR SIDE
            </p>

            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Adopt a mischievous{" "}
              <span className="text-emerald-400">Jack&nbsp;Russell</span>
              <br />
              and try to keep up.
            </h2>

            <p className="max-w-xl text-sm leading-relaxed text-zinc-400 sm:text-base">
              Feed, train, and clean up after your digital troublemaker. Watch
              them grow from chaotic puppy to loyal best friend—if you can
              manage their energy, mood, and potty breaks.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/adopt"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black shadow shadow-emerald-500/40 transition-transform hover:-translate-y-0.5 hover:bg-emerald-400"
              >
                Adopt your pup
              </Link>
              <Link
                to="/game"
                className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-black/40 px-5 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-emerald-400/80 hover:text-emerald-300"
              >
                Jump into game
              </Link>
            </div>

            {/* Feature bullets */}
            <dl className="grid gap-4 pt-4 text-xs sm:grid-cols-3 sm:text-sm">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <dt className="mb-1 font-semibold text-emerald-300">
                  Real-time needs
                </dt>
                <dd className="text-zinc-400">
                  Hunger, energy, and happiness always ticking.
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <dt className="mb-1 font-semibold text-emerald-300">
                  Potty & cleanliness
                </dt>
                <dd className="text-zinc-400">
                  Potty training, baths, and cleanliness tiers.
                </dd>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
                <dt className="mb-1 font-semibold text-emerald-300">
                  Grow together
                </dt>
                <dd className="text-zinc-400">
                  Puppy → adult → senior with unique temperaments.
                </dd>
              </div>
            </dl>
          </div>

          {/* Right: Dog card */}
          <div className="relative">
            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.35),_transparent_60%)] opacity-90 blur-3xl" />

            <div className="rounded-3xl border border-emerald-500/40 bg-zinc-950/90 px-6 py-6 shadow-[0_0_40px_rgba(16,185,129,0.35)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.65rem] uppercase tracking-[0.25em] text-zinc-500">
                    Current pup
                  </p>
                  <p className="text-lg font-semibold text-zinc-50">Fireball</p>
                  <p className="text-xs text-zinc-500">Jack Russell · Level 3</p>
                </div>
                <span className="rounded-full border border-emerald-500/50 bg-emerald-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-emerald-300">
                  Online
                </span>
              </div>

              {/* Dog preview */}
              <div className="relative mb-5 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-2xl" />
                <img
                  src="/assets/jack-russell-puppy.png"
                  alt="Jack Russell puppy from Doggerz"
                  className="relative h-28 w-auto drop-shadow-[0_12px_25px_rgba(0,0,0,0.85)]"
                />
              </div>

              {/* Mini stats */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-zinc-500">
                    Hunger
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-4/5 rounded-full bg-emerald-400" />
                  </div>

                  <p className="pt-2 text-[0.65rem] uppercase tracking-[0.2em] text-zinc-500">
                    Happiness
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-[90%] rounded-full bg-emerald-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[0.65rem] uppercase tracking-[0.2em] text-zinc-500">
                    Energy
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-2/3 rounded-full bg-emerald-400" />
                  </div>

                  <p className="pt-2 text-[0.65rem] uppercase tracking-[0.2em] text-zinc-500">
                    Cleanliness
                  </p>
                  <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                    <div className="h-full w-3/4 rounded-full bg-emerald-400" />
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <Link
                  to="/game"
                  className="flex-1 rounded-2xl bg-emerald-500 px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.18em] text-black hover:bg-emerald-400"
                >
                  Resume game
                </Link>
                <Link
                  to="/adopt"
                  className="rounded-2xl border border-zinc-700 bg-black/50 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-zinc-200 hover:border-emerald-400/80 hover:text-emerald-300"
                >
                  New pup
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="mt-12 flex flex-wrap justify-between gap-3 border-t border-zinc-900 pt-6 text-xs text-zinc-500">
          <span>
            © {new Date().getFullYear()} Doggerz · Created by William Johnson
          </span>
          <span className="text-zinc-600">
            Be kind to your real dogs. They are not respawnable.
          </span>
        </footer>
      </div>
    </main>
  );
}
