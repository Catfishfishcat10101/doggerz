import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";

import Dog from "@/components/Features/Dog";
import LogoutButton from "@/components/Auth/LogoutButton";

import {
  feedDog,
  playWithDog,
  batheDog,
  increasePottyLevel,
} from "@/redux/dogSlice";

function StatBar({ label, value, color = "bg-emerald-500" }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-white/70 mb-1">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 rounded bg-white/10 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function Game() {
  const dog = useSelector((s) => s.dog);
  const dispatch = useDispatch();

  const { hunger, happiness, energy, cleanliness } = dog.stats;

  return (
    <div className="min-h-screen bg-[#0b1020] text-white flex flex-col items-center">
      {/* Top bar */}
      <header className="w-full max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-wide">🐾 Doggerz</h1>
          {dog.name && <span className="text-white/70">• {dog.name}</span>}
          <span className="text-white/70">
            Lv {dog.level} • XP {dog.xp}
          </span>
          <span className="text-white/70">• {dog.coins} coins</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/shop"
            className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            Shop
          </Link>
          <LogoutButton className="ml-2" />
        </div>
      </header>

      {/* Main layout */}
      <main className="w-full max-w-5xl px-4 grid lg:grid-cols-[2fr_1fr] gap-6 pb-8">
        {/* Yard + Dog */}
        <section className="space-y-3">
          {/* Background yard */}
          <div className="relative w-full h-80 rounded-2xl shadow overflow-hidden bg-gradient-to-b from-sky-900/40 to-emerald-900/40">
            <Dog />
          </div>

          {/* Quick controls row */}
          <div className="bg-white/5 rounded-xl p-4 flex flex-wrap gap-2">
            <button
              className="px-3 py-2 rounded bg-amber-500 hover:bg-amber-600 text-black font-semibold"
              onClick={() => dispatch(feedDog())}
            >
              🍖 Feed
            </button>
            <button
              className="px-3 py-2 rounded bg-sky-500 hover:bg-sky-600 text-black font-semibold"
              onClick={() => dispatch(playWithDog())}
            >
              🦴 Play
            </button>
            <button
              className="px-3 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
              onClick={() => dispatch(batheDog())}
            >
              🛁 Bathe
            </button>
            <button
              className="px-3 py-2 rounded bg-lime-400 hover:bg-lime-500 text-black font-semibold"
              onClick={() => dispatch(increasePottyLevel(10))}
            >
              🚽 Potty Train
            </button>
          </div>
        </section>

        {/* Right rail: HUD + links */}
        <aside className="space-y-3">
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold mb-3">Dog Needs</h3>
            <StatBar label="Hunger" value={hunger} color="bg-amber-400" />
            <StatBar label="Happiness" value={happiness} color="bg-pink-500" />
            <StatBar label="Energy" value={energy} color="bg-sky-500" />
            <StatBar
              label={`Potty ${dog.isPottyTrained ? "(Trained!)" : "Training"}`}
              value={dog.pottyLevel}
              color="bg-lime-400"
            />
            <StatBar label="Cleanliness" value={cleanliness} color="bg-yellow-300" />
          </div>

          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <div className="flex flex-wrap gap-2">
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
                to="/upgrade"
                className="px-3 py-1 rounded bg-green-400 hover:bg-green-500 text-black font-semibold"
              >
                Yard Upgrades
              </Link>
            </div>
          </div>
        </aside>
      </main>

      {/* Controls hint */}
      <p className="text-xs text-white/50 mt-2">
        Use <b>WASD / Arrow keys</b> to move. Press <b>Space</b> to 💩.
      </p>
    </div>
  );
}