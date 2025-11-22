// src/components/ProgressBar.jsx
// @ts-nocheck

import React from "react";

export default function ProgressBar({
  label,
  value = 0,
  color = "emerald",
  showPercent = true,
}) {
  const colorMap = {
    emerald: "bg-emerald-500",
    cyan: "bg-cyan-500",
    blue: "bg-blue-500",
    amber: "bg-amber-500",
    zinc: "bg-zinc-500",
  };

  const barColor = colorMap[color] || colorMap.zinc;
  const pct = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div>
      {label && (
        <div className="flex justify-between text-xs text-zinc-400 mb-1">
          <span>{label}</span>
          {showPercent && <span>{pct}%</span>}
        </div>
      )}
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
