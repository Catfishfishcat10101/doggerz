// src/features/game/components/GameTopBar.jsx
// @ts-nocheck  // keep TS from whining about prop shapes in this JS file

import React from "react";

export default function GameTopBar({
  dogName = "Pup",
  level = 1,
  coins = 0,
  lifeStageLabel = "Puppy",
  lifeStageDay = 1,
  timeOfDay = "day",
  moodLabel = "Content",
  needs = {},
  temperamentRevealReady = false,
}) {
  /** @type {{ hunger?: number; happiness?: number; energy?: number; cleanliness?: number }} */
  const safeNeeds = needs || {};

  const {
    hunger = 0,
    happiness = 0,
    energy = 0,
    cleanliness = 0,
  } = safeNeeds;

  const clamp = (n) =>
    Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0;

  const formatNeed = (label, value) => {
    const v = clamp(value);

    let tone = "text-emerald-300";
    if (v < 30) tone = "text-rose-300";
    else if (v < 60) tone = "text-amber-200";

    return (
      <span className={`inline-flex items-center gap-1 ${tone}`} key={label}>
        <span className="text-[0.65rem] uppercase tracking-wide text-zinc-500">
          {label}
        </span>
        <span className="text-[0.75rem] font-semibold">{v}%</span>
      </span>
    );
  };

  const timePill = (() => {
    const label = (timeOfDay || "day").toString().toLowerCase();
    let bg = "bg-sky-900/60 text-sky-200 border-sky-500/40";

    if (label === "night") {
      bg = "bg-indigo-950/70 text-indigo-200 border-indigo-500/40";
    } else if (label === "dawn" || label === "dusk") {
      bg = "bg-amber-900/40 text-amber-200 border-amber-500/40";
    }

    return (
      <div
        className={`inline-flex items-center gap-1 rounded-full border px-2 py-[2px] text-[0.65rem] capitalize ${bg}`}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        <span>{label}</span>
      </div>
    );
  })();

  return (
    <header className="flex items-start justify-between gap-4">
      {/* Left side: identity & progression */}
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          {dogName}
        </h1>

        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-sky-300">
          Level {level} • {coins.toLocaleString()} coins
        </p>

        <p className="text-[0.7rem] text-emerald-200">
          {lifeStageLabel} • Day {lifeStageDay}
        </p>
      </div>

      {/* Right side: state & needs */}
      <div className="text-right text-xs text-zinc-300 space-y-1">
        <p className="font-medium text-sky-200">Mood: {moodLabel}</p>

        <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-0.5">
          {formatNeed("Hunger", hunger)}
          {formatNeed("Happy", happiness)}
          {formatNeed("Energy", energy)}
          {formatNeed("Clean", cleanliness)}
        </div>

        <div className="flex items-center justify-end gap-2 mt-1">
          {timePill}
        </div>

        {temperamentRevealReady && (
          <p className="inline-flex items-center justify-end gap-1 text-[0.65rem] text-amber-200 font-semibold mt-1">
            <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
            Temperament reveal ready
          </p>
        )}
      </div>
    </header>
  );
}
// src/constants/game.js
export const SKILL_LEVEL_STEP = 50;
export const DEFAULT_TICK_INTERVAL = 120; // seconds
export const CLOUD_SAVE_DEBOUNCE = 3000;
export const GAME_DAYS_PER_REAL_DAY = 4;
export const LIFE_STAGES = {
  PUPPY: { min: 0, max: 180, label: "Puppy" },
  ADULT: { min: 181, max: 2555, label: "Adult" },
  SENIOR: { min: 2556, max: 5475, label: "Senior" },
};
export const LIFECYCLE_STAGE_MODIFIERS = {
  PUPPY: {
    hunger: 1.15,
    happiness: 1,
    energy: 0.85,
    cleanliness: 0.95,
  },
  ADULT: {
    hunger: 1,
    happiness: 1,
    energy: 1,
    cleanliness: 1,
  },
  SENIOR: {
    hunger: 0.9,
    happiness: 1.05,
    energy: 1.2,
    cleanliness: 1.15,
  },
};
export const CLEANLINESS_THRESHOLDS = {
  FRESH: 75,
  DIRTY: 50,              
  FLEAS: 25,
  MANGE: 0,
};
export const CLEANLINESS_TIER_EFFECTS = {
  FRESH: {
    label: "Fresh",
    pottyGainMultiplier: 1,
  },
  DIRTY: { 
    label: "Dirty",
    happinessTickPenalty: 1,
    pottyGainMultiplier: 1.1,
    journalSummary: "Needs bath soon.",
  },
  FLEAS: {
    label: "Fleas",
    happinessTickPenalty: 2,
    energyTickPenalty: 1,  
    cleanlinessTickPenalty: 1,
    pottyGainMultiplier: 1.25,
    journalSummary: "Scratching nonstop!",
  },
  MANGE: {
    label: "Mange",
    happinessTickPenalty: 4,
    energyTickPenalty: 2,
    cleanlinessTickPenalty: 2,
    pottyGainMultiplier: 1.5,
    journalSummary: "Needs immediate attention!",
  },
};