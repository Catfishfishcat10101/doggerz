// src/components/TrainingStatsCard.jsx
// @ts-nocheck

import React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import { selectDogSkills } from "@/redux/dogSlice.js";

/**
 * TrainingStatsCard - displays obedience skill levels and XP progress.
 * @param {object} props
 */
function Row({ label, level, xp }) {
  const pct = Math.max(0, Math.min(100, Math.round(((xp % 50) / 50) * 100)));
  const xpToNext = 50 - (xp % 50);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs text-zinc-300">
        <span className="text-zinc-400" title={description || ""}>
          {label}
        </span>
        <span
          className="font-semibold text-zinc-100"
          title={`XP to next level: ${xpToNext}`}
        >
          Lv {level}
        </span>
      </div>
      <div
        className="h-1.5 bg-zinc-800 rounded-full overflow-hidden"
        aria-label={`${label} XP progress bar, ${pct}% complete, ${xpToNext} XP to next level`}
      >
        <div
          className="h-full bg-emerald-500"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label} XP ${pct}%`}
          tabIndex={0}
        />
      </div>
    </div>
  );
}

Row.propTypes = {
  label: PropTypes.string.isRequired,
  level: PropTypes.number.isRequired,
  xp: PropTypes.number.isRequired,
};

export default function TrainingStatsCard() {
  const skills = useSelector(selectDogSkills) || {};
  // Support dynamic skill branches and skills
  const skillBranches = Object.keys(skills);

  return (
    <section
      className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3"
      aria-label="Training stats"
    >
      <header className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-100">Training stats</h3>
      </header>
      {skillBranches.map((branch) => (
        <div key={branch} className="space-y-2">
          <div className="text-xs text-zinc-400 font-semibold mb-1">
            {branch.charAt(0).toUpperCase() + branch.slice(1)}
          </div>
          {Object.entries(skills[branch]).map(([id, skill]) => (
            <Row
              key={id}
              label={id.charAt(0).toUpperCase() + id.slice(1)}
              level={skill.level || 0}
              xp={skill.xp || 0}
              description={skill.description || ""}
            />
          ))}
        </div>
      ))}
    </section>
  );
}
