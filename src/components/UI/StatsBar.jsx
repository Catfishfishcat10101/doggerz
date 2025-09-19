// src/components/UI/StatsBar.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectHappiness } from "../../redux/dogSlice";

/**
 * StatsBar
 * - Shows Happiness as a responsive, animated bar with thresholds, ticks, and mood emoji.
 * - Accessible (aria-*), reduced-motion friendly, and works in compact HUDs.
 *
 * Props:
 *   compact?: boolean  // smaller height/fonts (default false)
 *   label?: string     // override "Happiness"
 */
export default function StatsBar({ compact = false, label = "Happiness" }) {
  const happiness = useSelector(selectHappiness);
  const clamped = clamp(happiness, 0, 100);

  // Compute visual state
  const band = useBand(clamped);
  const mood = useMood(clamped);

  const barClasses = useMemo(
    () =>
      [
        "rounded",
        "transition-[width,background-color,box-shadow]",
        "duration-500",
        "ease-out",
        "motion-reduce:transition-none",
        band.bg,
        band.glow,
        compact ? "h-2" : "h-3",
      ].join(" "),
    [band, compact]
  );

  const railClasses = useMemo(
    () =>
      [
        "rounded",
        "bg-emerald-900/10",
        "relative",
        compact ? "h-2 w-40" : "h-3 w-48",
        "overflow-hidden",
      ].join(" "),
    [compact]
  );

  return (
    <div className="w-full max-w-4xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={["font-semibold text-emerald-900", compact ? "text-sm" : ""].join(" ")}
        >
          {label}
        </span>

        <div
          className={railClasses}
          role="progressbar"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(clamped)}
          title={`${label}: ${Math.round(clamped)}% (${band.name})`}
        >
          {/* subtle grid ticks (every 10%) */}
          <Ticks />

          {/* actual fill */}
          <div className={barClasses} style={{ width: `${clamped}%` }} />

          {/* value tag */}
          <ValueTag value={clamped} compact={compact} />
        </div>

        {/* mood badge */}
        <span
          className={[
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-lg",
            "border text-xs",
            band.badge,
          ].join(" ")}
          title={`Mood: ${mood.label}`}
        >
          <span aria-hidden="true">{mood.emoji}</span>
          <span className="hidden sm:inline">{mood.label}</span>
        </span>
      </div>
    </div>
  );
}

/* ---------------- helpers ---------------- */

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function useBand(v) {
  // semantic bands for colors/glow/badge
  if (v > 66)
    return {
      name: "Happy",
      bg: "bg-emerald-500",
      glow: "shadow-[0_0_0_3px_rgba(16,185,129,0.20)]",
      badge: "bg-emerald-100 border-emerald-300 text-emerald-800",
    };
  if (v > 33)
    return {
      name: "Okay",
      bg: "bg-amber-500",
      glow: "shadow-[0_0_0_3px_rgba(245,158,11,0.20)]",
      badge: "bg-amber-100 border-amber-300 text-amber-800",
    };
  return {
    name: "Low",
    bg: "bg-rose-500",
    glow: "shadow-[0_0_0_3px_rgba(244,63,94,0.20)]",
    badge: "bg-rose-100 border-rose-300 text-rose-800",
  };
}

function useMood(v) {
  if (v > 90) return { emoji: "🤩", label: "Ecstatic" };
  if (v > 70) return { emoji: "😊", label: "Happy" };
  if (v > 50) return { emoji: "🙂", label: "Content" };
  if (v > 33) return { emoji: "😕", label: "Meh" };
  if (v > 15) return { emoji: "😟", label: "Sad" };
  return { emoji: "💀", label: "Miserable" };
}

/* Ticks (every 10%) */
function Ticks() {
  const items = new Array(9).fill(0); // 10%,20%,...90%
  return (
    <div className="absolute inset-0 pointer-events-none opacity-30">
      <div className="absolute inset-0 grid grid-cols-10">
        {items.map((_, i) => (
          <div key={i} className="border-r border-emerald-900/10" />
        ))}
      </div>
    </div>
  );
}

/* Value bubble that hugs the bar end */
function ValueTag({ value, compact }) {
  const left = `${clamp(value, 0, 100)}%`;
  return (
    <div
      className={[
        "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 select-none",
        "px-1.5 rounded-md text-[10px] font-mono",
        "bg-white/80 border border-emerald-900/15 backdrop-blur",
        "motion-reduce:transition-none transition-transform duration-500 ease-out",
        compact ? "py-0.5" : "py-1",
      ].join(" ")}
      style={{ left }}
      aria-hidden="true"
    >
      {Math.round(value)}%
    </div>
  );
}
