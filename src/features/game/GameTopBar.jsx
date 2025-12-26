// src/features/game/GameTopBar.jsx
// Lightweight top HUD bar for the "MainGame" experience.
// (This file previously contained router code by mistake; keep it focused as a UI component.)

import * as React from "react";

export default function GameTopBar({
  dogName = "Pup",
  level = 1,
  coins = 0,
  lifeStageLabel = "Puppy",
  lifeStageDay = 1,
  moodLabel = "Content",
  needs = { hunger: 50, happiness: 50, energy: 50, cleanliness: 50 },
}) {
  const chip = "rounded-full border px-3 py-1 text-[11px] font-semibold";

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/70 backdrop-blur-md px-4 py-3 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/60 dark:text-zinc-100">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-sm font-extrabold">
            {dogName}
            <span className="ml-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Lv {level} · {lifeStageLabel} (Day {lifeStageDay})
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className={`${chip} border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200`}>
              Mood: {moodLabel}
            </span>
            <span className={`${chip} border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-black/30 dark:text-zinc-200`}>
              Coins: {coins}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`${chip} border-amber-500/25 bg-amber-500/10 text-amber-900 dark:text-amber-200`}>
            Hunger {Math.round(needs.hunger)}
          </span>
          <span className={`${chip} border-emerald-500/25 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200`}>
            Happy {Math.round(needs.happiness)}
          </span>
          <span className={`${chip} border-sky-500/25 bg-sky-500/10 text-sky-900 dark:text-sky-200`}>
            Energy {Math.round(needs.energy)}
          </span>
        </div>
      </div>
    </header>
  );
}