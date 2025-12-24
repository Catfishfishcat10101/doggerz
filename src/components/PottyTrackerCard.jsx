// src/components/PottyTrackerCard.jsx
// @ts-nocheck
import React from "react";

function clamp01(n) {
  const x = Number(n || 0);
  return Math.max(0, Math.min(100, x));
}

export default function PottyTrackerCard({ percent = 0 }) {
  const v = clamp01(percent);

  return (
    <div className="rounded-2xl border border-emerald-500/15 bg-black/30 backdrop-blur-md p-4 shadow-[0_0_28px_rgba(16,185,129,0.10)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-emerald-200">
          Potty Training Tracker
        </h3>
        <div className="text-xs font-semibold text-zinc-200">{v}%</div>
      </div>

      <div className="mt-2 h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${v}%` }}
        />
      </div>

      <p className="mt-2 text-xs text-zinc-400">
        Potty training unlocks trick training at 100%.
      </p>
    </div>
  );
}
