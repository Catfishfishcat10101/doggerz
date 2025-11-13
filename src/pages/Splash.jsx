// src/pages/Splash.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-xl mx-auto px-4 text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Doggerz
        </h1>

        <p className="text-zinc-400">
          Adopt your virtual pup and keep their stats up. This splash is real
          now, not a throwaway screen.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            to="/game"
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition"
          >
            Start Game
          </Link>

          <Link
            to="/adopt"
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold border border-emerald-500 text-emerald-300 hover:bg-emerald-950/40 transition"
          >
            Adopt a New Pup
          </Link>
        </div>

        <p className="text-xs text-zinc-500 mt-4">
          We&apos;ll plug auth and the rest of your layout back in after the
          main game screen is solid.
        </p>
      </div>
    </div>
  );
}
