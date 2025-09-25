// src/components/UI/StatsBar.jsx
import React, { memo, useMemo } from "react";
import { useSelector } from "react-redux";

/**
 * Threshold → color logic
 * v is 0..100
 */
function colorFor(label, v) {
  // Positive metrics: higher is better
  const goodUp = ["Happiness", "Energy", "Cleanliness"];
  // Negative metrics (we invert with computedValue already, but keep hook flexible)
  const goodDown = ["Hunger"];

  const isUp = goodUp.includes(label);
  const isDown = goodDown.includes(label);

  // Zones
  if (v >= 70) return isDown ? "#f59e0b" : "#10b981"; // hunger 70 (i.e. low hunger) still shows as amber by default—tune if you don’t invert
  if (v >= 40) return "#f59e0b";
  return "#ef4444";
}

function srPercent(v) {
  return `${Math.round(v)} percent`;
}

function Bar({
  id,
  label,
  value = 0,          // 0..100
  hint,               // optional help text
  showBadge = false,  // shows numeric badge
  striped = false,    // subtle moving stripes (reduced motion friendly)
}) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  const color = useMemo(() => colorFor(label, v), [label, v]);

  return (
    <div className="space-y-1" role="group" aria-labelledby={id}>
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-rose-900/70 dark:text-rose-200/70" id={id}>
          {label}
        </div>
        {showBadge && (
          <span
            className="text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
            aria-hidden
          >
            {Math.round(v)}%
          </span>
        )}
      </div>

      <div
        className={[
          "h-3 rounded-full overflow-hidden",
          "bg-slate-200/70 dark:bg-slate-800/80 border border-black/5 dark:border-white/10"
        ].join(" ")}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v)}
        aria-describedby={hint ? `${id}-hint` : undefined}
        aria-label={`${label}: ${srPercent(v)}`}
      >
        <div
          className={[
            "h-full rounded-full transition-[width] duration-300 ease-out will-change-[width]",
            striped ? "bg-[linear-gradient(90deg,rgba(255,255,255,0.25)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.25)_50%,rgba(255,255,255,0.25)_75%,transparent_75%,transparent)] bg-[length:16px_16px] motion-safe:animate-[barberpole_3s_linear_infinite]" : ""
          ].join(" ")}
          style={{ width: `${v}%`, backgroundColor: color }}
        />
      </div>

      {hint && (
        <div id={`${id}-hint`} className="text-[11px] text-rose-900/60 dark:text-rose-200/60">
          {hint}
        </div>
      )}
    </div>
  );
}

/**
 * StatsBar
 * - Accepts props or pulls safe fallbacks from Redux if available.
 * - hunger is inverted visually by default (lower hunger → higher “fullness” bar).
 */
function StatsBar({
  happiness,
  energy,
  cleanliness,
  hunger,                 // 0..100 hunger (higher = hungrier)
  compact = false,        // tighter spacing
  showBadges = true,      // show numeric % badges
  className = "",
}) {
  // Safe Redux fallbacks (optional; won’t crash if selectors not present)
  const s = useSelector((st) => st?.dog) || {};
  const H = happiness ?? (typeof s.happiness === "number" ? s.happiness : 50);
  const E = energy ?? (typeof s.energy === "number" ? s.energy : 50);
  const C = cleanliness ?? (typeof s.cleanliness === "number" ? s.cleanliness : 50);
  const Hu = hunger ?? (typeof s.hunger === "number" ? s.hunger : 50);

  // Invert hunger to display “Fullness”
  const fullness = Math.max(0, 100 - Hu);

  return (
    <div
      className={[
        "rounded-2xl shadow p-4 border border-black/5 dark:border-white/10",
        "bg-white dark:bg-slate-900",
        compact ? "space-y-2" : "space-y-3",
        className,
      ].join(" ")}
    >
      <Bar id="stat-happy" label="Happiness" value={H} showBadge={showBadges} />
      <Bar id="stat-energy" label="Energy" value={E} showBadge={showBadges} />
      <Bar id="stat-clean" label="Cleanliness" value={C} showBadge={showBadges} />
      <Bar
        id="stat-fullness"
        label="Fullness"
        value={fullness}
        showBadge={showBadges}
        hint="Higher is better. Keep your pup fed."
        striped={fullness >= 80} // subtle “well-fed” vibe
      />

      <style>
        {`
        @keyframes barberpole {
          0% { background-position: 0 0; }
          100% { background-position: 16px 0; }
        }
      `}
      </style>
    </div>
  );
}

export default memo(StatsBar);
