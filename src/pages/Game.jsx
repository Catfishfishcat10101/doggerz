// src/pages/Game.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import Dog from "@/components/Features/Dog.jsx";
import {
  feedDog,
  playWithDog,
  batheDog,
  increasePottyLevel,
  selectDog,
} from "@/redux/dogSlice.js";

function StatBar({ label, value, color = "bg-emerald-500" }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function Game() {
  const dog = useSelector(selectDog);
  const dispatch = useDispatch();
  const { hunger, happiness, energy, cleanliness } = dog.stats;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Doggerz</h1>
          <p className="text-sm text-zinc-400">
            {dog.name && <span className="font-medium">{dog.name}</span>} • Lv{" "}
            {dog.level} • XP {dog.xp} • {dog.coins} coins
          </p>
        </div>

        <Link
          to="/shop"
          className="rounded-full px-4 py-2 text-sm font-medium bg-amber-500 text-zinc-900 hover:bg-amber-400"
        >
          Shop
        </Link>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Yard + Dog */}
        <div className="relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-bgd-800 to-bgd-900 p-4">
          <div className="relative h-72 rounded-xl overflow-hidden bg-[radial-gradient(circle_at_20%_0,#1e293b,transparent_55%),radial-gradient(circle_at_80%_100%,#0f172a,transparent_55%)]">
            <Dog />
          </div>

          {/* Quick controls */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => dispatch(feedDog())}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
            >
              Feed
            </button>
            <button
              onClick={() => dispatch(playWithDog())}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
            >
              Play
            </button>
            <button
              onClick={() => dispatch(batheDog())}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
            >
              Bathe
            </button>
            <button
              onClick={() => dispatch(increasePottyLevel(10))}
              className="rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700"
            >
              Potty Train
            </button>
          </div>
        </div>

        {/* Right rail: stats + quick links */}
        <aside className="space-y-4">
          <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">Dog Needs</h2>
            <StatBar label="Hunger" value={hunger} color="bg-emerald-500" />
            <StatBar label="Happiness" value={happiness} color="bg-sky-500" />
            <StatBar label="Energy" value={energy} color="bg-violet-500" />
            <StatBar
              label="Cleanliness"
              value={cleanliness}
              color="bg-cyan-400"
            />
          </section>

          <section className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">Quick Links</h2>
            <div className="flex flex-wrap gap-2 text-sm">
              <Link
                className="rounded-full bg-zinc-800 px-3 py-1 hover:bg-zinc-700"
                to="/affection"
              >
                Affection
              </Link>
              <Link
                className="rounded-full bg-zinc-800 px-3 py-1 hover:bg-zinc-700"
                to="/memory"
              >
                Memories
              </Link>
              <Link
                className="rounded-full bg-zinc-800 px-3 py-1 hover:bg-zinc-700"
                to="/potty"
              >
                Potty
              </Link>
              <Link
                className="rounded-full bg-zinc-800 px-3 py-1 hover:bg-zinc-700"
                to="/upgrade"
              >
                Yard Upgrades
              </Link>
            </div>
          </section>

          <p className="text-xs text-zinc-500">
            Move your dog with WASD or arrow keys. Press Space to handle
            accidents.
          </p>
        </aside>
      </div>
    </div>
  );
}