// src/components/UI/Splash.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Splash() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Top bar */}
      <header className="max-w-6xl mx-auto px-6 pt-10 flex items-center justify-between">
        <div className="text-sm font-semibold tracking-wide text-slate-300">
          DOGGERZ
        </div>
        <div className="text-xs text-slate-400">
          Doggerz 2025 · Be kind to your dogs.
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10 items-center">
        {/* Left: copy + CTA */}
        <section>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight">
            Raise your <span className="text-sky-400">pixel pup</span>.<br />
            Keep it happy. <span className="text-sky-400">Show it off.</span>
          </h1>

          <p className="mt-5 text-slate-300 max-w-xl">
            Frictionless onboarding, true offline play, and cloud saves when you’re back online.
            Cosmetics you actually care about. Zero clutter. Maximum vibes.
          </p>

          <div className="mt-8 flex gap-4">
            <Link
              to="/signup"
              className="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 font-semibold"
            >
              Create account
            </Link>
            <Link
              to="/login"
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold"
            >
              I already have one
            </Link>
          </div>
        </section>

        {/* Right: simple dog preview card (no tiles/pink square) */}
        <section className="relative">
          <div className="rounded-3xl p-8 bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl">
            <div className="rounded-2xl p-6 bg-slate-900/60 border border-slate-800 flex items-center justify-center min-h-[280px]">
              <img
                src="@/assets/sprites/jack_russell_directions.png"
                alt="Doggerz jack russell preview"
                className="w-48 h-auto"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
            <div className="mt-4 text-center text-slate-400 text-sm">
              Your pup, your story — plays offline, syncs when online.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
