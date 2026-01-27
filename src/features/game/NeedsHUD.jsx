/** @format */
// src/features/game/NeedsHUD.jsx

import { useMemo } from "react";

const METRICS = [
  { key: "food", label: "Food" },
  { key: "water", label: "Water" },
  { key: "energy", label: "Energy" },
  { key: "happiness", label: "Mood" },
  { key: "potty", label: "Potty" },
  { key: "cleanliness", label: "Clean" },
  { key: "bond", label: "Bond" },
];

function clamp01(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export default function NeedsHUD({ needs = {} }) {
  const values = useMemo(() => {
    const v = {};
    METRICS.forEach((it) => {
      v[it.key] = clamp01(needs[it.key]);
    });
    return v;
  }, [needs]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-[#05070d] via-[#07090f] to-black/60 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/80" />

      <div className="relative z-10">
        <header className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">
            Vitals
          </p>
          <h3 className="text-lg font-extrabold text-white">Vitals</h3>
        </header>

        <div className="space-y-3">
          {METRICS.map((metric) => (
            <VitalRow
              key={metric.key}
              label={metric.label}
              value={values[metric.key]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function VitalRow({ label, value = 0 }) {
  const pct = Math.round((value || 0) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 text-xs font-semibold text-white/70">{label}</div>
      <div className="flex-1">
        <div className="h-2 rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-200"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="w-10 text-right text-[11px] font-semibold text-emerald-200">
        {pct}%
      </div>
    </div>
  );
}
