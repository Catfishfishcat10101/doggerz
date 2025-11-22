// src/components/ProgressBar.jsx
// @ts-nocheck

import React from "react";

export default function ProgressBar({
  label,
  value = 0,
  color = "emerald",
  showPercent = true,
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));

  const colorMap = {
    emerald: "from-emerald-400 via-emerald-500 to-lime-400",
    cyan: "from-cyan-400 via-cyan-500 to-sky-400",
    blue: "from-sky-400 via-blue-500 to-indigo-500",
    amber: "from-amber-300 via-amber-400 to-orange-500",
    zinc: "from-zinc-400 via-zinc-500 to-zinc-300",
  };

  const glowMap = {
    emerald: "shadow-emerald-500/35",
    cyan: "shadow-cyan-400/35",
    blue: "shadow-sky-500/35",
    amber: "shadow-amber-400/35",
    zinc: "shadow-zinc-500/25",
  };

  const barGradient = colorMap[color] || colorMap.zinc;
  const barGlow = glowMap[color] || glowMap.zinc;

  return (
    <div className="space-y-1.5">
      {label && (
        <div className="flex items-center justify-between text-[0.7rem] text-zinc-400">
          <span className="tracking-wide uppercase">{label}</span>
          {showPercent && (
            <span className="font-medium text-zinc-300">{pct}%</span>
          )}
        </div>
      )}

      <div className="relative h-2.5 overflow-hidden rounded-full border border-zinc-800/80 bg-zinc-950/80">
        {/* Background track shimmer */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(148,163,184,0.15),transparent_50%),radial-gradient(circle_at_100%_100%,rgba(15,23,42,0.9),transparent_55%)]" />

        {/* Fill bar */}
        <div
          className={`relative h-full rounded-full bg-gradient-to-r ${barGradient} ${barGlow} transition-all duration-500 ease-out`}
          style={{ width: `${pct}%` }}
        >
          {/* Subtle highlight strip */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 opacity-40 mix-blend-screen bg-[linear-gradient(to_bottom,rgba(255,255,255,0.45),transparent)]" />
        </div>
      </div>
    </div>
  );
}
// End of src/components/ProgressBar.jsx
