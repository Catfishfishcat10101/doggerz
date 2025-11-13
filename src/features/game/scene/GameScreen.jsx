// src/features/game/scene/GameScreen.jsx
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectDog,
  feed,
  play,
  rest,
  scoopPoop,
} from "@/redux/dogSlice.js";

import DogAIEngine from "../systems/DogAIEngine.jsx";
import Dog from "../entities/Dog.jsx";
import StatsBar from "../hud/StatsBar.jsx";
import Status from "../hud/Status.jsx";
import PoopScoop from "../hud/PoopScoop.jsx";
import Scene from "./Scene.jsx"; // ✅ new import

/* ------------------------------ Helpers ------------------------------ */

function clampStat(value) {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function getMoodLabel({ hunger, energy, cleanliness, happiness }) {
  const vals = [
    clampStat(hunger),
    clampStat(energy),
    clampStat(cleanliness),
    clampStat(happiness),
  ];
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

  if (avg >= 80) return "Thriving";
  if (avg >= 55) return "Content";
  if (avg >= 35) return "Needy";
  return "Stressed";
}

/**
 * GameScreen
 * - Central scene for gameplay
 * - Renders stats header, dog stage, and status HUD
 * - DogAIEngine runs the background tick loop
 */
export default function GameScreen() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog) || {};

  const {
    name = "Unnamed Pup",
    coins = 0,
    poopCount = 0,
    stats = {},
  } = dog;

  const {
    hunger = 50,
    energy = 50,
    cleanliness = 50,
    happiness = 50,
  } = stats;

  const mood = getMoodLabel({ hunger, energy, cleanliness, happiness });

  // --- Player Actions ---
  const handleFeed = useCallback(() => dispatch(feed()), [dispatch]);
  const handlePlay = useCallback(() => dispatch(play()), [dispatch]);
  const handleRest = useCallback(() => dispatch(rest()), [dispatch]);
  const handleScoop = useCallback(() => dispatch(scoopPoop()), [dispatch]);

  return (
    <div className="min-h-screen bg-bgd-900 text-white flex flex-col items-center gap-6 p-6">
      {/* Headless engine */}
      <DogAIEngine />

      {/* HEADER / TOP HUD */}
      <header className="w-full max-w-3xl space-y-3">
        <StatsBar />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {name}
              <span className="text-[11px] uppercase tracking-wide bg-zinc-800/80 px-2 py-0.5 rounded-full border border-zinc-700">
                {mood}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              {coins} coin{coins === 1 ? "" : "s"} • {poopCount} poop pile
              {poopCount === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 text-sm">
            <button
              type="button"
              onClick={handleFeed}
              className="rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold hover:bg-emerald-500"
            >
              Feed
            </button>
            <button
              type="button"
              onClick={handlePlay}
              className="rounded-lg bg-sky-600 px-3 py-1.5 font-semibold hover:bg-sky-500"
            >
              Play
            </button>
            <button
              type="button"
              onClick={handleRest}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold hover:bg-indigo-500"
            >
              Rest
            </button>
            <button
              type="button"
              onClick={handleScoop}
              disabled={poopCount <= 0}
              className="rounded-lg bg-amber-600 px-3 py-1.5 font-semibold hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Scoop
            </button>
          </div>
        </div>
      </header>

      {/* MAIN DOG AREA */}
      <section className="w-full max-w-3xl grid place-items-center">
        {/* ✅ Use the yard scene instead of a plain div */}
        <Scene>
          <Dog />
        </Scene>

        {poopCount > 0 && (
          <div className="mt-3 w-full flex items-center justify-between text-xs text-amber-200 bg-amber-500/10 border border-amber-500/40 rounded-xl px-3 py-2">
            <span>{poopCount} accident(s) waiting…</span>
            <PoopScoop />
          </div>
        )}
      </section>

      {/* STATUS HUD CARD */}
      <aside className="w-full max-w-3xl">
        <Status />
      </aside>
    </div>
  );
}
