// src/features/game/MainGame.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";


/**
 * MainGame is the core “in-yard” experience:
 * - Left: animated yard & dog movement
 * - Right: stats + actions (via StatsPanel)
 */
export default function MainGame() {
  const dog = useSelector(selectDog);

  // Hard-guard for when Redux isn't hydrated yet
  if (!dog) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="space-y-3 text-center max-w-sm px-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Loading your pup…
          </h1>
          <p className="text-xs text-zinc-400">
            If this screen is stuck, use the back button and go through the
            Adopt flow again so Doggerz can create your save file.
          </p>
        </div>
      </main>
    );
  }

  const dogName = dog.name || "Pup";
  const level = Number.isFinite(dog.level) ? dog.level : 1;
  const coins = Number.isFinite(dog.coins) ? dog.coins : 0;

  const hunger = Math.round(dog.stats?.hunger ?? 0);
  const happiness = Math.round(dog.stats?.happiness ?? 0);
  const energy = Math.round(dog.stats?.energy ?? 0);
  const cleanliness = Math.round(dog.stats?.cleanliness ?? 0);

  const moodLabel = dog.mood?.label || "Calibrating vibe…";

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-slate-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-4 lg:py-6 space-y-4">
        {/* ---------- Top Bar / Meta HUD ---------- */}
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
              {dogName}
            </h1>
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-sky-300">
              Level {level} • {coins} coins
            </p>
          </div>

          <div className="text-right text-xs text-zinc-300 space-y-1">
            <p className="font-medium text-sky-200">Mood: {moodLabel}</p>
            <p className="text-[0.7rem] text-zinc-400">
              H {hunger} • Ha {happiness} • En {energy} • Cl {cleanliness}
            </p>
          </div>
        </header>

        {/* ---------- Main Layout ---------- */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] items-start">
          {/* Yard / Dog / World */}
          <div className="bg-sky-950/40 border border-sky-800/70 rounded-2xl shadow-xl shadow-sky-950/70 overflow-hidden">
            
          </div>

          {/* Right rail: stats + helper copy */}
          <aside className="space-y-4">
            <div className="bg-zinc-900/80 border border-zinc-700/80 rounded-2xl p-3 lg:p-4 shadow-lg shadow-black/50">
              
            </div>

            <div className="bg-zinc-900/70 border border-zinc-700/60 rounded-2xl p-3 lg:p-4 text-xs text-zinc-400 space-y-2">
              <p className="font-semibold text-zinc-200 text-sm">
                How to grind XP & coins
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Keep all four needs (H / Ha / En / Cl) out of the red.</li>
                <li>Use care actions in the stats panel to recover needs.</li>
                <li>
                  The better you maintain your pup, the faster XP and coins
                  accrue in the background.
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
