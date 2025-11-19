import React from "react";

export default function GameTopBar({
  dogName,
  level,
  coins,
  lifeStageLabel,
  lifeStageDay,
  timeOfDay,
  moodLabel,
  needs = {},
  temperamentRevealReady,
}) {
  const { hunger = 0, happiness = 0, energy = 0, cleanliness = 0 } = needs;

  return (
    <header className="flex items-center justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">{dogName}</h1>
        <p className="text-[0.7rem] uppercase tracking-[0.2em] text-sky-300">
          Level {level} • {coins} coins
        </p>
        <p className="text-[0.7rem] text-emerald-200">
          {lifeStageLabel} • Day {lifeStageDay}
        </p>
      </div>

      <div className="text-right text-xs text-zinc-300 space-y-1">
        <p className="font-medium text-sky-200">Mood: {moodLabel}</p>
        <p className="text-[0.7rem] text-zinc-400">
          H {hunger} • Ha {happiness} • En {energy} • Cl {cleanliness}
        </p>
        <p className="text-[0.7rem] text-zinc-500 capitalize">Time of day: {timeOfDay}</p>
        {temperamentRevealReady && (
          <p className="inline-flex items-center justify-end gap-1 text-[0.65rem] text-amber-200 font-semibold">
            <span className="h-2 w-2 rounded-full bg-amber-300 animate-pulse" />
            Temperament reveal ready
          </p>
        )}
      </div>
    </header>
  );
}
