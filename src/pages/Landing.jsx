// src/pages/Landing.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className="relative w-full max-w-3xl mx-auto text-center">
        {/* Subtle glow behind the logo */}
        <div className="pointer-events-none absolute inset-0 blur-3xl opacity-40 bg-gradient-to-r from-emerald-500/40 via-cyan-400/30 to-indigo-500/40" />

        <div className="relative z-10 space-y-10 py-10">
          {/* Logo / Title */}
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">
              Virtual Pup Simulator
            </p>
            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-[0.15em] drop-shadow-lg">
              DOGGERZ
            </h1>
            <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-300/90">
              Feed, play, train. All the dog chaos,{" "}
              <span className="font-semibold text-emerald-300">
                none of the chewed cables.
              </span>
            </p>
          </div>
          <img
  src="/assets/dog-silhouette.svg"
  alt="Dog Silhouette"
  className="w-40 h-40 mx-auto animate-float opacity-80"
/>


          {/* Primary CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            {/* Start Game */}
            <Link
              to="/game"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full text-sm sm:text-base font-semibold
                         bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600
                         text-slate-950 shadow-lg shadow-emerald-500/30
                         transition-transform transition-colors duration-150
                         hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
            >
              Start Game
            </Link>

            {/* Sign In */}
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm sm:text-base font-medium
                         border border-slate-700/80 bg-slate-900/60 hover:bg-slate-800/90
                         text-slate-100/90 shadow-md shadow-slate-900/70
                         transition-transform transition-colors duration-150
                         hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500"
            >
              Sign In
            </Link>

            {/* Adopt / create dog profile */}
            <Link
              to="/adopt"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full text-sm sm:text-base font-medium
                         border border-emerald-400/60 bg-transparent hover:bg-emerald-500/10
                         text-emerald-300/95
                         transition-transform transition-colors duration-150
                         hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70"
            >
              Adopt a Pup
            </Link>
          </div>

          {/* Small helper text */}
          <p className="text-[0.7rem] sm:text-xs text-slate-400/80">
            Jump straight into the chaos with{" "}
            <Link
              to="/game"
              className="underline underline-offset-4 decoration-slate-500 hover:text-emerald-300"
            >
              Jump to Game
            </Link>{" "}
            or start clean with a brand new adoption.
          </p>
        </div>
      </div>
    </div>
  );
}
