// src/pages/Game.jsx
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import DogAIEngine from "@/features/game/DogAIEngine.jsx";
import MainGame from "@/features/game/MainGame.jsx";

export default function Game() {
  const dog = useSelector(selectDog);

  // Set browser tab title
  useEffect(() => {
    document.title = "Doggerz • Main Game";
  }, []);

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-zinc-100 flex justify-center px-4 py-6">
      <div className="w-full max-w-5xl space-y-4">
        {/* Header */}
        <header className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
              Your Pup
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              Check in, feed them, keep them clean — Doggerz tracks time while
              you’re away.
            </p>
          </div>

          {/* Display current life stage + day */}
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="inline-flex items-center rounded-full border border-zinc-700/60 bg-zinc-900/80 px-3 py-1">
              {dog?.lifeStageLabel ?? "Puppy"} • Day {dog?.gameDay ?? 0}
            </span>
          </div>
        </header>

        {/* Game logic engine */}
        <DogAIEngine />

        {/* Main game stage */}
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
