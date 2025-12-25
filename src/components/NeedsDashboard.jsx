// src/components/NeedsDashboard.jsx
// @ts-nocheck

import React from "react";

// Internal model in dogSlice:
//   hunger: 0   → no hunger (full)
//   hunger: 100 → max hunger (starving)
//
// For the UI we want the opposite feeling:
//   Hunger 100% → dog is full
//   Hunger 0%   → dog is starving
//
// So we special-case "hunger" below and invert it.

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
    <div className="bg-zinc-900/80 border border-zinc-700/80 rounded-2xl p-3 lg:p-4 shadow-lg shadow-black/50 space-y-4">
      <p className="text-sm font-semibold text-zinc-100">Needs dashboard</p>

      <div className="space-y-3">
        {NEEDS_CONFIG.map(({ key, label, accent }) => {
          const raw = clamp(Number(needs[key] ?? 0));

          // Internal 'hunger' is "how hungry"
          // UI should show "how full".
          const value = key === "hunger" ? 100 - raw : raw;

          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${accent}`}
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
