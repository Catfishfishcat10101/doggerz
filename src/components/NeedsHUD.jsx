// src/components/NeedsHUD.jsx
// @ts-nocheck

import React from "react";

function Bar({ label, value, color = "emerald", inverse = false }) {
  const colors = {
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    blue: "bg-blue-500",
    cyan: "bg-cyan-500",
    zinc: "bg-zinc-500",
  };
  const raw = Number.isFinite(value) ? value : 0;
  const pct = Math.max(0, Math.min(100, inverse ? 100 - raw : raw));
  return (
    <div className="min-w-[160px]">
      <div className="flex justify-between text-[10px] text-zinc-400 mb-0.5">
        <span>{label}</span>
        <span>{Math.round(raw)}%</span>
      </div>
      <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color] || colors.zinc}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function NeedsHUD({ needs = {}, className = "" }) {
  const { hunger = 0, happiness = 0, energy = 0, cleanliness = 0 } = needs;

  return (
    <div className={[
      "rounded-xl border border-zinc-800/80 bg-zinc-900/85 backdrop-blur px-3 py-2",
      "shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
      className,
    ].join(" ")}
      aria-label="Needs HUD"
    >
      <div className="flex flex-col gap-1">
        <Bar label="Hunger" value={hunger} color="amber" inverse />
        <Bar label="Happiness" value={happiness} color="emerald" />
        <Bar label="Energy" value={energy} color="blue" />
        <Bar label="Cleanliness" value={cleanliness} color="cyan" />
      </div>
    </div>
  );
}
