import * as React from "react";
import TraitImpactIndicator from "@/features/personality/TraitImpactIndicator.jsx";

function clamp(n, lo, hi) {
  return Math.max(lo, Math.min(hi, Number.isFinite(n) ? n : 0));
}

function pctFromSigned(value) {
  // [-100..100] -> [0..100]
  return Math.round(((clamp(value, -100, 100) + 100) / 200) * 100);
}

function leanLabel(value, leftLabel, rightLabel) {
  const v = clamp(value, -100, 100);
  const abs = Math.abs(v);

  const strength = abs >= 80 ? "Strongly" : abs >= 55 ? "Clearly" : abs >= 30 ? "Slightly" : "Balanced";
  if (strength === "Balanced") return `Balanced`;
  return v >= 0 ? `${strength} ${rightLabel}` : `${strength} ${leftLabel}`;
}

export default function PersonalityTraitCard({
  traitKey,
  title,
  leftLabel,
  rightLabel,
  value,
}) {
  const pct = React.useMemo(() => pctFromSigned(Number(value || 0)), [value]);
  const lean = React.useMemo(
    () => leanLabel(Number(value || 0), leftLabel, rightLabel),
    [leftLabel, rightLabel, value],
  );

  return (
    <div className="rounded-3xl border border-white/15 bg-black/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
            Personality
          </div>
          <div className="mt-0.5 text-sm font-extrabold text-emerald-200">
            {title}
          </div>
          <div className="mt-1 text-xs text-zinc-300">{lean}</div>
        </div>

        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            Lean
          </div>
          <div className="text-xs font-semibold text-zinc-100">{pct}%</div>
        </div>
      </div>

      {/* Axis */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-[11px] text-zinc-400">
          <span>{leftLabel}</span>
          <span>{rightLabel}</span>
        </div>
        <div className="mt-1 h-2.5 w-full rounded-full bg-white/10 overflow-hidden" aria-hidden>
          <div
            className="h-full bg-gradient-to-r from-sky-400/50 via-white/10 to-emerald-400/60"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Impacts */}
      <details className="mt-3 group">
        <summary className="cursor-pointer select-none text-xs font-semibold text-zinc-200 hover:text-white">
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-zinc-300">
              impacts
            </span>
            How this affects your pup
            <span className="text-zinc-500 group-open:hidden">▾</span>
            <span className="text-zinc-500 hidden group-open:inline">▴</span>
          </span>
        </summary>
        <div className="mt-2">
          <TraitImpactIndicator traitKey={traitKey} value={value} />
        </div>
      </details>
    </div>
  );
}
