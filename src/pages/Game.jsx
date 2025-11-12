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

/* ------------------------------ Helpers ------------------------------ */

function clampStat(value) {
  const n = Number(value ?? 0);
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function getMoodLabel({ hunger, happiness, energy, cleanliness }) {
  const vals = [hunger, happiness, energy, cleanliness].map(clampStat);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;

  if (avg >= 80) return { label: "Thriving", tone: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40" };
  if (avg >= 55) return { label: "Content", tone: "bg-sky-500/10 text-sky-200 border-sky-500/30" };
  if (avg >= 35) return { label: "Needy", tone: "bg-amber-500/10 text-amber-200 border-amber-500/30" };
  return { label: "Stressed", tone: "bg-rose-500/10 text-rose-200 border-rose-500/30" };
}

/* ------------------------------ UI bits ------------------------------ */

function StatBar({ label, value, color = "bg-emerald-500" }) {
  const pct = clampStat(value);

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className={`h-full ${color} transition-[width] duration-300 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function QuickActionButton({ label, onClick, emoji }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-1 rounded-lg bg-zinc-800 px-3 py-2 text-sm hover:bg-zinc-700 active:scale-[0.98] transition-transform"
    >
      {emoji && <span aria-hidden="true">{emoji}</span>}
      <span>{label}</span>
    </button>
  );
}

/* ------------------------------ Page ------------------------------ */

export default function Game() {
  const dog = useSelector(selectDog);
  const dispatch = useDispatch();

  // Defensive fallback so the page doesn’t blow up if hydrateDog hasn’t run yet
  const stats = dog?.stats ?? {
    hunger: 50,
    happiness: 50,
    energy: 50,
    cleanliness: 50,
  };

  const { hunger, happiness, energy, cleanliness } = stats;
  const mood = getMoodLabel(stats);

  const pottyLevel = dog?.pottyLevel ?? 0;
  const isPottyTrained = !!dog?.isPottyTrained;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Doggerz</h1>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium ${mood.tone}`}
            >
              {mood.label}
            </span>
          </div>

          <p className="text-sm text-zinc-400">
            {dog?.name && (
              <>
                <span className="font-medium">{dog.name}</span>
                <span className="mx-1.5 text-zinc-600">•</span>
              </>
            )}
            <span>Lv {dog?.level ?? 1}</span>
            <span className="mx-1.5 text-zinc-600">•</span>
            <span>XP {dog?.xp ?? 0}</span>
            <span className="mx-1.5 text-zinc-600">•</span>
            <span>{dog?.coins ?? 0} coins</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/shop"
            className="rounded-full px-4 py-2 text-sm font-medium bg-amber-500 text-zinc-900 hover:bg-amber-400 shadow-sm"
          >
            Shop
          </Link>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        {/* Yard + Dog viewport */}
        <div className="relative rounded-2xl border border-zinc-800 bg-gradient-to-b from-bgd-800 to-bgd-900 p-4">
          <div className="relative h-72 rounded-xl overflow-hidden bg-[radial-gradient(circle_at_20%_0,#1e293b,transparent_55%),radial-gradient(circle_at_80%_100%,#0f172a,transparent_55%)]">
            <Dog />
          </div>

          {/* Quick controls */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickActionButton
              label="Feed"
              emoji="🍖"
              onClick={() => dispatch(feedDog())}
            />
            <QuickActionButton
              label="Play"
              emoji="🦴"
              onClick={() => dispatch(playWithDog())}
            />
            <QuickActionButton
              label="Bathe"
              emoji="🛁"
              onClick={() => dispatch(batheDog())}
            />
            <QuickActionButton
              label="Potty Train"
              emoji="🚽"
              onClick={() => dispatch(increasePottyLevel(10))}
            />
          </div>

          {/* Potty micro-status */}
          <div className="mt-3 flex items-center justify-between text-xs text-zinc-400">
            <span>
              Potty skill:{" "}
              <span className="font-semibold text-zinc-200">
                {clampStat(pottyLevel)}%
              </span>
            </span>
            <span
              className={
                isPottyTrained
                  ? "text-emerald-300"
                  : "text-amber-300"
              }
            >
              {isPottyTrained ? "House-trained ✔" : "Still learning…"}
            </span>
          </div>
        </div>

        {/* Right rail: stats + navigation */}
        <aside className="space-y-4">
          {/* Needs / stats */}
          <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">
              Dog Needs
            </h2>
            <StatBar label="Hunger" value={hunger} color="bg-emerald-500" />
            <StatBar label="Happiness" value={happiness} color="bg-sky-500" />
            <StatBar label="Energy" value={energy} color="bg-violet-500" />
            <StatBar
              label="Cleanliness"
              value={cleanliness}
              color="bg-cyan-400"
            />
          </section>

          {/* Feature shortcuts */}
          <section className="space-y-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
            <h2 className="text-sm font-semibold text-zinc-200">
              Quick Links
            </h2>
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

          {/* Controls hint / keyboard legend */}
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Controls
            </h2>

            <p className="text-xs text-zinc-400">
              Move your dog with{" "}
              <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono">
                W A S D
              </span>{" "}
              or{" "}
              <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono">
                ↑ ↓ ← →
              </span>
              .
            </p>
            <p className="text-xs text-zinc-400">
              Press{" "}
              <span className="inline-flex items-center gap-1 rounded bg-zinc-900 px-1.5 py-0.5 text-[10px] font-mono">
                Space
              </span>{" "}
              near an accident to clean it up.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
