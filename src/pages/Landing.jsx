// src/pages/Landing.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex flex-col">
      {/* Top bar */}
      <header className="w-full border-b border-zinc-800">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          {/* Logo / wordmark */}
          <div className="flex flex-col leading-tight">
            <span className="text-2xl sm:text-3xl font-black tracking-[0.2em] text-emerald-400">
              Doggerz
            </span>
            <span className="text-[0.7rem] sm:text-xs uppercase tracking-[0.25em] text-zinc-400">
              Adopt. Train. Bond.

            </span>
          </div>

          {/* Auth links */}
          <nav className="flex items-center gap-6 text-sm sm:text-base">
            <Link
              to="/login"
              className="text-zinc-300 hover:text-zinc-50 transition-colors"
            >
              Login
            </Link>
            <Link
              to="/adopt"
              className="rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
            >
              Adopt
            </Link>
          </nav>
        </div>
      </header>

      {/* Main hero content */}
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:py-16 lg:py-20 grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] items-start">
          {/* Left: copy + CTAs */}
          <section className="space-y-6">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-zinc-500">
              Virtual Dog • Real-time Needs • Non-pausing
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-zinc-50">
              A little dog that{" "}
              <span className="text-emerald-400">doesnt pause</span>{" "}
              when you do.
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-zinc-300">
              Adopt a pup that keeps living in real time while you deal with
              real life. Hunger, energy, happiness, and cleanliness all tick
              down whether youre watching or not.
            </p>

            <p className="max-w-xl text-sm sm:text-base text-zinc-400">
              Feed, clean, train, and try not to ghost your dog. Miss a few
              days and your pup will definitely have feelings about it.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <Link
                to="/adopt"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-colors"
              >
                Adopt a pup
              </Link>

              <div className="text-xs sm:text-sm text-zinc-400">
                Already have a pup?{" "}
                <Link
                  to="/login"
                  className="font-medium text-emerald-400 hover:text-emerald-300"
                >
                  Log in
                </Link>
              </div>
            </div>
          </section>

          {/* Right: preview card stub (UI only for now) */}
          <section className="hidden lg:flex justify-end">
            <div className="relative w-full max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/40 p-5">
              <div className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase mb-3">
                Preview
              </div>

              <div
                className="aspect-square w-full rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-center mb-4"
                role="img"
                aria-label="Preview placeholder for a Doggerz pup"
              >
                {/* Placeholder for future live dog sprite */}
                <div className="h-20 w-20 rounded-2xl bg-zinc-800" />
              </div>

              <div className="text-sm text-zinc-400">Adopt a pup to see live stats and temperament.</div>
            </div>
          </section>
        </div>
      </main>

      {/* Simple footer */}
      <footer className="w-full border-t border-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-4 text-[0.7rem] sm:text-xs text-zinc-500 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Doggerz — 2025 All Rights Reserved</span>
          <span className="hidden sm:inline">
            Be kind to real dogs as well as your virtual one.
          </span>
        </div>
      </footer>
    </div>
  );
}
