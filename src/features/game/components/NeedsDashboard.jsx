// src/features/game/components/NeedsDashboard.jsx
// @ts-nocheck

import React from "react";
import PropTypes from "prop-types";

/**
 * NeedsDashboard - displays dog needs (hunger, happiness, energy, cleanliness).
 * @param {object} props
 * @param {object} [props.needs] - Needs object with hunger, happiness, energy, cleanliness
 */

const NEEDS_CONFIG = [
  { key: "hunger", label: "Hunger", accent: "bg-rose-400" },
  { key: "happiness", label: "Happiness", accent: "bg-amber-300" },
  { key: "energy", label: "Energy", accent: "bg-emerald-400" },
  { key: "cleanliness", label: "Cleanliness", accent: "bg-cyan-300" },
];

const clamp = (n, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Number.isFinite(n) ? n : 0));

export default function NeedsDashboard({ needs = {} }) {
  return (
    <div
      className="bg-zinc-900/80 border border-zinc-700/80 rounded-2xl p-3 lg:p-4 shadow-lg shadow-black/50 space-y-4"
      role="region"
      aria-label="Dog needs dashboard"
    >
      <p className="text-sm font-semibold text-zinc-100">Needs dashboard</p>

      <div className="space-y-3">
        {NEEDS_CONFIG.map(({ key, label, accent }) => {
          const raw = clamp(Number(needs[key] ?? 0));

          // Special handling: internal 'hunger' is "how hungry"
          // UI should show "how full" as a percentage.
          const value = key === "hunger" ? 100 - raw : raw;

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-100">
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <div
                className="h-2 rounded-full bg-zinc-800 overflow-hidden"
                aria-label={`${label} level`}
              >
                <div
                  className={`h-full rounded-full ${accent}`}
                  style={{ width: `${value}%` }}
                  role="progressbar"
                  aria-valuenow={value}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  tabIndex={0}
                  aria-label={`${label} ${value}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

NeedsDashboard.propTypes = {
  needs: PropTypes.shape({
    hunger: PropTypes.number,
    happiness: PropTypes.number,
    energy: PropTypes.number,
    cleanliness: PropTypes.number,
  }),
};
