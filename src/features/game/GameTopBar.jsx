// @ts-nocheck
// src/features/game/GameTopBar.jsx

import React from "react";
import PropTypes from "prop-types";

/**
 * GameTopBar
 *  - Shows dog name, level, coins, and a time-of-day pill.
 */
export default function GameTopBar({
  name = "Pup",
  level = 1,
  xp = 0,
  coins = 0,
  stage,
  timeOfDay = "day",
}) {
  const stageLabel = formatStage(stage);
  const timeLabel = formatTimeOfDay(timeOfDay);

  return (
    <header
      className="w-full flex items-center justify-between gap-3 bg-black/45 border border-emerald-500/40 rounded-2xl px-3 py-2.5 backdrop-blur"
      aria-label="Game top bar"
    >
      {/* Left: Dog name + stage */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">
            Doggerz
          </span>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold leading-tight">
              {name}
            </h1>
            {stageLabel && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-600/30 border border-emerald-400/40 text-emerald-100 uppercase tracking-wide">
                {stageLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Center: level / xp */}
      <div className="hidden sm:flex flex-col items-center text-xs">
        <div className="flex items-baseline gap-2">
          <span className="uppercase tracking-wide text-slate-200">Level</span>
          <span className="text-lg font-bold text-emerald-300">{level}</span>
        </div>
        <span className="text-[11px] text-slate-300">XP: {xp}</span>
      </div>

      {/* Right: coins + time-of-day */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900/70 border border-yellow-400/40">
          <span className="text-xs font-semibold text-yellow-300">⬤</span>
          <span className="text-xs font-semibold text-yellow-100">{coins}</span>
        </div>

        <div className="px-2 py-1 rounded-full border border-sky-400/40 bg-sky-900/50 text-[11px] font-medium text-sky-100 uppercase tracking-wide">
          {timeLabel}
        </div>
      </div>
    </header>
  );
}

function formatStage(stage) {
  if (!stage) return "";
  // Accept either a string stage (e.g. "PUPPY") or a lifeStage object
  let value = stage;
  if (typeof stage === "object") {
    // prefer explicit fields if provided
    value = stage.stage || stage.id || stage.label || "";
  }

  const s = String(value).toLowerCase();
  if (s === "puppy") return "Puppy";
  if (s === "adult") return "Adult";
  if (s === "senior") return "Senior";
  return String(value);
}

function formatTimeOfDay(timeOfDay) {
  const t = String(timeOfDay).toLowerCase();
  if (t === "morning") return "Morning";
  if (t === "afternoon") return "Afternoon";
  if (t === "evening") return "Evening";
  if (t === "night") return "Night";
  return "Day";
}

GameTopBar.propTypes = {
  name: PropTypes.string,
  level: PropTypes.number,
  xp: PropTypes.number,
  coins: PropTypes.number,
  stage: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  timeOfDay: PropTypes.string,
};
