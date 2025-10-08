import React from "react";

function Bar({ label, value, srHint }) {
  const pct = Math.round(value);
  // high-contrast track + labeled value (no color-only encoding)
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs text-zinc-300">
        <span>{label}</span>
        <span className="font-mono tabular-nums">{pct}%</span>
      </div>
      <div
        className="h-3 rounded-md bg-zinc-800 border border-zinc-700 overflow-hidden"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-describedby={srHint ? `${label}-hint` : undefined}
      >
        <div
          className="h-full bg-white/80"
          style={{ width: `${pct}%` }}
        />
      </div>
      {srHint && (
        <div id={`${label}-hint`} className="sr-only">
          {srHint}
        </div>
      )}
    </div>
  );
}

export default function StatsBar({ stats }) {
  return (
    <section className="w-full max-w-xl rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
      <Bar label="Hunger"      value={stats.hunger}      srHint="Decreases over time; feed to restore." />
      <Bar label="Energy"      value={stats.energy}      srHint="Decreases over time; resting restores." />
      <Bar label="Cleanliness" value={stats.cleanliness} srHint="Decreases over time; washing restores." />
      <Bar label="Happiness"   value={stats.happiness}   srHint="Impacted by other needs; play to restore." />
    </section>
  );
}
