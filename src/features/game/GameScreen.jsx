import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDog, feed, play, rest, scoopPoop } from "@/redux/dogSlice.js";

import DogAIEngine from "@/features/game/systems/DogAIEngine.jsx";
import NeedsHUD from "@/features/game/hud/NeedsHUD.jsx";

/**
 * GameScreen.jsx
 * Central orchestrator for Doggerz gameplay UI.
 * Renders the dog stage, buttons, and HUD.
 * The logic systems run in DogAIEngine (background tick loop).
 */
export default function GameScreen() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog) || {};

  const {
    name = "Unnamed Pup",
    mood = "Neutral",
    coins = 0,
    poopCount = 0,
    stats = {},
  } = dog;

  const { hunger = 50, energy = 50, cleanliness = 50, happiness = 50 } = stats;

  // --- Player Actions ---
  const handleFeed = useCallback(() => dispatch(feed()), [dispatch]);
  const handlePlay = useCallback(() => dispatch(play()), [dispatch]);
  const handleRest = useCallback(() => dispatch(rest()), [dispatch]);
  const handleScoop = useCallback(() => dispatch(scoopPoop()), [dispatch]);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-zinc-950 to-zinc-900 text-white overflow-hidden">
      {/* Headless systems */}
      <DogAIEngine />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              {name}
              <span className="text-xs bg-zinc-800 border border-white/10 rounded-full px-2 py-0.5">
                {mood}
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              {coins} coins • {poopCount} poop piles
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleFeed}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold hover:bg-emerald-500"
            >
              Feed
            </button>
            <button
              onClick={handlePlay}
              className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold hover:bg-sky-500"
            >
              Play
            </button>
            <button
              onClick={handleRest}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold hover:bg-indigo-500"
            >
              Rest
            </button>
            <button
              onClick={handleScoop}
              disabled={poopCount <= 0}
              className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold disabled:opacity-40 hover:bg-amber-500"
            >
              Scoop
            </button>
          </div>
        </header>

        {/* Game scene */}
        <section className="grid grid-cols-1 lg:grid-cols-[2fr,1fr] gap-6">
          {/* Left: Dog/Scene */}
          <div className="relative aspect-video rounded-xl border border-white/10 bg-zinc-800/40 backdrop-blur-sm flex items-center justify-center">
            <div className="text-7xl">🐕</div>
          </div>

          {/* Right: HUD */}
          <aside className="rounded-xl border border-white/10 bg-zinc-900 p-4">
            <h2 className="text-sm font-semibold text-zinc-300">Dog Status</h2>
            <NeedsHUD
              hunger={hunger}
              energy={energy}
              cleanliness={cleanliness}
              happiness={happiness}
            />
          </aside>
        </section>
      </main>
    </div>
  );
}