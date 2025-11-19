// src/features/game/components/NeedsDashboard.jsx
import React from "react";

const NEEDS_CONFIG = [
  { key: "hunger", label: "Hunger", accent: "bg-rose-400" },
  { key: "happiness", label: "Happiness", accent: "bg-amber-300" },
  { key: "energy", label: "Energy", accent: "bg-emerald-400" },
  { key: "cleanliness", label: "Cleanliness", accent: "bg-cyan-300" },
];

export default function NeedsDashboard({ needs = {} }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-700/80 rounded-2xl p-3 lg:p-4 shadow-lg shadow-black/50 space-y-4">
      <p className="text-sm font-semibold text-zinc-100">Needs dashboard</p>
      <div className="space-y-3">
        {NEEDS_CONFIG.map(({ key, label, accent }) => {
          const value = Math.round(Number(needs[key] ?? 0));
          return (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{label}</span>
                <span>{value}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800">
                <div className={`h-full rounded-full ${accent}`} style={{ width: `${value}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
