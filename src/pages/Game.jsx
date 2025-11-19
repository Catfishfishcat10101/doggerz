// src/pages/Game.jsx
import React, { useEffect } from "react";
import DogAIEngine from "@/features/game/DogAIEngine.jsx";
import MainGame from "@/features/game/MainGame.jsx";

export default function Game() {
  // Page-level side effect: keep this screen labeled in the browser tab
  useEffect(() => {
    document.title = "Doggerz • Main Game";
  }, []);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-zinc-100 flex justify-center px-4 py-6">
      <div className="w-full max-w-5xl space-y-4">
        {/* Page header / micro-hero */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">
              Doggerz Playground
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              Keep your pup fed, rested, and clean. Time keeps ticking even when
              you&apos;re away.
            </p>
          </div>

          {/* Fun little status pill, no logic required */}
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-3 py-1 text-[10px] sm:text-xs font-medium text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span>AI Link Active</span>
          </div>
        </header>

        {/* 
          Invisible brain: runs timers / decay / sync.
          Keep it mounted at page level so MainGame can stay mostly UI-focused.
        */}
        <DogAIEngine />

        {/* Main game stage wrapper */}
        <section
          aria-label="Doggerz main game view"
          className="rounded-2xl bg-slate-900/80 border border-slate-700/60 shadow-xl overflow-hidden"
        >
          <MainGame />
        </section>
      </div>
    </main>
  );
}
