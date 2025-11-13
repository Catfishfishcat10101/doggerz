// src/features/game/GameScreen.jsx
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";

import {
  selectDog,
  feed,
  play,
  rest,
  scoopPoop,
} from "@/redux/dogSlice.js";

import DogAIEngine from "@/features/game/systems/DogAIEngine.jsx";
import DogStage from "@/features/game/entities/DogStage.jsx";
import NeedsHUD from "@/features/game/NeedsHUD.jsx";
import Status from "@/features/game/hud/Status.jsx";
import PoopScoop from "@/features/game/hud/PoopScoop.jsx";

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
 * GameScreen.jsx
 * Central orchestrator for Doggerz gameplay UI.
 * Renders dog stage, actions, and HUD.
 * Background tick loop runs in DogAIEngine.
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
    <div className="min-h-dvh bg-gradient-to-b from-zinc-950 to-zinc-900 text-white overflow-hidden">
      {/* Headless systems */}
      <DogAIEngine />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
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

          <div className="flex flex-wrap gap-2">
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

        {/* Yard + HUD grid */}
        <section className="w-full grid lg:grid-cols-[2fr_1fr] gap-6">
          {/* Left: yard + dog stage */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-gradient-to-b from-bgd-800 to-bgd-900 p-4">
              <DogStage />
            </div>

            {/* Optional inline poop scoop CTA */}
            {poopCount > 0 && (
              <div className="flex items-center justify-between text-xs text-amber-200 bg-amber-500/10 border border-amber-500/40 rounded-xl px-3 py-2">
                <span>{poopCount} accident(s) waiting…</span>
                <PoopScoop />
              </div>
            )}
          </section>

          {/* Right: HUD + quick links */}
          <aside className="space-y-4">
            {/* Needs HUD (single source of truth) */}
            <aside className="rounded-xl border border-white/10 bg-zinc-900 p-4">
              <h2 className="text-sm font-semibold text-zinc-300 mb-2">
                Dog Status
              </h2>
              <NeedsHUD
                hunger={hunger}
                energy={energy}
                cleanliness={cleanliness}
                happiness={happiness}
              />
            </aside>

            {/* Status text */}
            <section className="rounded-xl border border-white/10 bg-zinc-900 p-4">
              <Status />
            </section>

            {/* Quick Links */}
            <section className="bg-white/5 rounded-xl p-4">
              <h3 className="font-semibold mb-2 text-sm">Quick Links</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                <Link
                  to="/affection"
                  className="px-3 py-1 rounded bg-pink-400 hover:bg-pink-500 text-black font-semibold"
                >
                  Affection
                </Link>
                <Link
                  to="/memory"
                  className="px-3 py-1 rounded bg-blue-400 hover:bg-blue-500 text-black font-semibold"
                >
                  Memories
                </Link>
                <Link
                  to="/potty"
                  className="px-3 py-1 rounded bg-lime-400 hover:bg-lime-500 text-black font-semibold"
                >
                  Potty
                </Link>
                <Link
                  to="/u
