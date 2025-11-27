// Other imports
// src/components/GameTopBar.jsx
// @ts-nocheck
//
// Doggerz: In-game status bar for the current pup.
// Shows dog name, level, life stage/day, and current mood.

import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectUser } from "@/redux/userSlice.js";
import { selectDog } from "@/redux/dogSlice.js";

// derive readable mood string from stats
function deriveMood(stats) {
  const { hunger = 50, happiness = 50, energy = 50, cleanliness = 50 } = stats;

  if (energy <= 10) return "Exhausted";
  if (hunger >= 80) return "Hungry";
  if (cleanliness <= 25) return "Filthy";
  if (happiness <= 25) return "Sad";
  if (happiness >= 85) return "Ecstatic";
  return "Content";
}

function getMoodStyle(mood) {
  switch (mood) {
    case "Exhausted":
      return {
        label: "Exhausted",
        badgeClass: "bg-sky-900/70 text-sky-200 border-sky-500/60",
      };
    case "Hungry":
      return {
        label: "Hungry",
        badgeClass: "bg-amber-900/70 text-amber-200 border-amber-500/60",
      };
    case "Filthy":
      return {
        label: "Needs bath",
        badgeClass: "bg-lime-900/70 text-lime-200 border-lime-500/60",
      };
    case "Sad":
      return {
        label: "Sad",
        badgeClass: "bg-purple-900/70 text-purple-200 border-purple-500/60",
      };
    case "Ecstatic":
      return {
        label: "Ecstatic",
        badgeClass: "bg-emerald-900/70 text-emerald-200 border-emerald-500/70",
      };
    default:
      return {
        label: "Content",
        badgeClass: "bg-zinc-900/80 text-zinc-100 border-zinc-600/80",
      };
  }
}

export default function GameTopBar({
  dogName = "Pup",
  level = 1,
  lifeStageLabel = "Puppy",
  lifeStageDay = 1,
  stats = {},
  pottyLevel = 0, // reserved for future badges
  pottyTraining = 0, // reserved for future badges
  isAsleep = false,
}) {
  const user = useSelector(selectUser);
  const dogFromStore = useSelector(selectDog);

  const resolvedDogName = dogName || dogFromStore?.name || "Pup";

  const moodRaw = deriveMood(stats);
  const moodInfo = getMoodStyle(moodRaw);

  let firstName = null;
  if (user) {
    if (user.displayName) {
      firstName = user.displayName.split(" ")[0];
    } else if (user.email) {
      firstName = user.email.split("@")[0];
    }
  }

  return (
    <header
      className="w-full bg-zinc-900/80 backdrop-blur-sm border-b border-zinc-800 px-3 py-2 sm:px-4 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      role="region"
      aria-label="Dog status bar"
    >
      {/* Left cluster: brand + dog identity */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col leading-tight">
          <span className="text-[9px] uppercase tracking-[0.28em] text-emerald-400/90"></span>
          Doggerz • Yard
        </div>
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg sm:text-xl font-bold text-white">
            {resolvedDogName}
          </h1>
          <span className="text-xs text-emerald-300 font-mono">Lv {level}</span>
        </div>
      </div>

      {/* Right cluster: life stage + mood */}
      <div className="flex flex-col items-start sm:items-end gap-1">
        <span className="inline-flex items-center rounded-full bg-zinc-900 px-3 py-1 text-[11px] text-zinc-100 font-medium border border-zinc-700/80">
          <span className="uppercase tracking-[0.18em] text-zinc-400 mr-2">
            Stage
          </span>
          <span className="text-zinc-100">
            {lifeStageLabel} • Day {lifeStageDay}
          </span>
        </span>

        <span
          className="inline-flex items-center gap-2 text-xs text-zinc-100"
          aria-live="polite"
        >
          {isAsleep ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.9)]" />
              <span className="text-sky-300 font-medium">Sleeping</span>
            </>
          ) : (
            <>
              <span className="text-[10px] uppercase tracking-[0.22em] text-zinc-400">
                Mood
              </span>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${moodInfo.badgeClass}`}
              >
                {moodInfo.label}
              </span>
            </>
          )}
        </span>
      </div>
    </header>
  );
}

GameTopBar.propTypes = {
  dogName: PropTypes.string,
  level: PropTypes.number,
  lifeStageLabel: PropTypes.string,
  lifeStageDay: PropTypes.number,
  stats: PropTypes.object,
  pottyLevel: PropTypes.number,
  pottyTraining: PropTypes.number,
  isAsleep: PropTypes.bool,
};
