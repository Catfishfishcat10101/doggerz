// src/pages/Game.jsx
import React from "react";
import { Link } from "react-router-dom";
import { PATHS } from "@/routes.js";
import GameScreen from "@/features/game/scene/GameScreen.jsx";

export default function GamePage() {
  return (
    <main className="min-h-screen bg-bgd-950 text-white flex flex-col">
      {/* Thin top shell nav */}
      <header className="w-full border-b border-zinc-900/80 bg-zinc-950/90 backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between text-sm">
          <div className="font-semibold tracking-tight">Doggerz</div>
          <nav className="flex items-center gap-3">
            <Link
              to={PATHS.HOME}
              className="text-zinc-400 hover:text-zinc-100"
            >
              Home
            </Link>
            <Link
              to={PATHS.SPLASH}
              className="text-zinc-400 hover:text-zinc-100"
            >
              Splash
            </Link>
            <Link
              to={PATHS.ADOPT}
              className="inline-flex items-center rounded-lg px-3 py-1.5 bg-emerald-500 text-emerald-950 font-medium hover:bg-emerald-400"
            >
              Adopt / Rename Pup
            </Link>
            <Link
  to={PATHS.PROFILE}
  className="text-zinc-400 hover:text-zinc-100"
>
  Profile
</Link>

          </nav>
        </div>
      </header>

      {/* Core gameplay surface */}
      <section className="flex-1 flex items-stretch justify-center px-4 sm:px-6 lg:px-8 py-6">
        <div className="w-full max-w-5xl">
          <GameScreen />
        </div>
      </section>
    </main>
  );
}
