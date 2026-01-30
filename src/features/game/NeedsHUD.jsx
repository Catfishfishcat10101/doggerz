/** @format */
// src/features/game/NeedsHUD.jsx

import { useMemo } from "react";

const METRICS = [
  { key: "food", label: "Food", tone: "emerald" },
  { key: "water", label: "Water", tone: "sky" },
  { key: "energy", label: "Energy", tone: "amber" },
  { key: "happiness", label: "Mood", tone: "rose" },
  { key: "potty", label: "Potty", tone: "violet" },
  { key: "cleanliness", label: "Clean", tone: "teal" },
  { key: "bond", label: "Bond", tone: "lime" },
];

function clamp01(n) {
  const x = Number(n);
  if (Number.isNaN(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

export default function NeedsHUD({ needs = {}, scene = null }) {
  const values = useMemo(() => {
    const v = {};
    METRICS.forEach((it) => {
      v[it.key] = clamp01(needs[it.key]);
    });
    return v;
  }, [needs]);

  const lowest = useMemo(() => {
    let key = METRICS[0]?.key || null;
    let value = values[key] ?? 1;
    METRICS.forEach((metric) => {
      const next = values[metric.key];
      if (typeof next === "number" && next < value) {
        value = next;
        key = metric.key;
      }
    });
    return { key, value: Number.isFinite(value) ? value : 1 };
  }, [values]);

  const weatherLabel = scene?.weather;
  const weatherAccent =
    scene?.weatherAccent || "var(--weather-accent, #34d399)";

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-[#05070d] via-[#07090f] to-black/60 p-5 shadow-[0_30px_70px_rgba(0,0,0,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/40 via-transparent to-black/80" />

      <div className="relative z-10">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.4em] text-white/50">
              Vitals
            </p>
            <h3 className="text-lg font-extrabold text-white">Vitals</h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] text-white/70">
              Focus:{" "}
              <span className="font-semibold text-emerald-200">
                {METRICS.find((m) => m.key === lowest.key)?.label || "Check all"}
              </span>
            </div>
            {weatherLabel ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/70">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: weatherAccent }}
                />
                <span className="font-semibold">{weatherLabel}</span>
              </div>
            ) : null}
          </div>
        </header>

        <div className="space-y-3">
          {METRICS.map((metric) => (
            <VitalRow
              key={metric.key}
              label={metric.label}
              value={values[metric.key]}
              tone={metric.tone}
              isLow={metric.key === lowest.key}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const TONE_CLASSES = {
  emerald: { bar: "from-emerald-400 to-emerald-200", text: "text-emerald-200" },
  sky: { bar: "from-sky-400 to-sky-200", text: "text-sky-200" },
  amber: { bar: "from-amber-400 to-amber-200", text: "text-amber-200" },
  rose: { bar: "from-rose-400 to-rose-200", text: "text-rose-200" },
  violet: { bar: "from-violet-400 to-violet-200", text: "text-violet-200" },
  teal: { bar: "from-teal-400 to-teal-200", text: "text-teal-200" },
  lime: { bar: "from-lime-400 to-lime-200", text: "text-lime-200" },
};

function toneClasses(tone) {
  return TONE_CLASSES[tone] || TONE_CLASSES.emerald;
}

function VitalRow({ label, value = 0, tone = "emerald", isLow = false }) {
  const pct = Math.round((value || 0) * 100);
  const toneClass = toneClasses(tone);
  return (
    <div
      className={`flex items-center gap-3 ${
        isLow ? "rounded-2xl border border-amber-400/20 bg-amber-500/5 px-2 py-1" : ""
      }`}
    >
      <div className="w-20 text-xs font-semibold text-white/70">{label}</div>
      <div className="flex-1">
        <div className="h-2 rounded-full bg-white/10">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${toneClass.bar}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className={`w-10 text-right text-[11px] font-semibold ${toneClass.text}`}>
        {pct}%
      </div>
    </div>
  );
}
