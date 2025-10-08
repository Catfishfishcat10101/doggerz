// src/components/game/StatsBar.jsx
import React from "react";

export default function StatsBar() {
  return (
    <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
      <Stat label="Hunger" value={95} icon="🍖" />
      <Stat label="Energy" value={100} icon="⚡" />
      <Stat label="Cleanliness" value={98} icon="🧼" />
    </div>
  );
}

function Stat({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-2">
      <div className="flex items-center justify-between">
        <span className="font-semibold">{label}</span>
        <span aria-hidden="true">{icon}</span>
      </div>
      <div className="mt-1 flex items-center gap-2">
        <div className="relative h-2 flex-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white/70"
            style={{ width: `${value}%` }}
            aria-hidden="true"
          />
        </div>
        <span className="w-10 text-right tabular-nums">{Math.round(value)}%</span>
      </div>
    </div>
  );
}