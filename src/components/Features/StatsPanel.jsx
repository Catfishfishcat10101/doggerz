// src/components/Features/StatsPanel.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import * as dogSlice from "../../redux/dogSlice"; // probe optional selectors safely

/* ----------------------------------------------------------
   Prefer slice selectors if present; otherwise safe fallbacks
---------------------------------------------------------- */
const selectDog =
  dogSlice.selectDog || ((s) => s.dog ?? {});
const selectLevel =
  dogSlice.selectDogLevel || ((s) => Number(s.dog?.level ?? 1));
const selectXP =
  dogSlice.selectXP || ((s) => Number(s.dog?.xp ?? 0));
const selectCoins =
  dogSlice.selectCoins || ((s) => Number(s.dog?.coins ?? 0));
const selectHappiness =
  dogSlice.selectHappiness || ((s) => Number(s.dog?.happiness ?? s.dog?.needs?.happiness ?? 50));

/**
 * StatsPanel
 * - Level, XP progress, coins
 * - Needs bars: happiness, energy, cleanliness, hunger (inverted)
 * - Session buff read from sessionStorage
 *
 * Props:
 *  - className?: string
 *  - compact?: boolean
 */
export default function StatsPanel({ className = "", compact = false }) {
  const dog = useSelector(selectDog);
  const level = useSelector(selectLevel);
  const xp = useSelector(selectXP);
  const coins = useSelector(selectCoins);
  const happiness = useSelector(selectHappiness);

  const needs = dog?.needs ?? {};
  const energy = Number(needs.energy ?? 50);
  const cleanliness = Number(needs.cleanliness ?? 50);
  const hungerRaw = Number(needs.hunger ?? 50); // 0 = best, 100 = starving
  const hungerInverted = clamp(100 - hungerRaw, 0, 100); // higher = better for the bar

  // XP progress to next level
  const xpRange = useMemo(() => {
    const curMin = levelXP(level);
    const nextMin = levelXP(level + 1);
    const into = Math.max(0, xp - curMin);
    const span = Math.max(1, nextMin - curMin);
    const pct = clamp((into / span) * 100, 0, 100);
    return { curMin, nextMin, into, span, pct };
  }, [level, xp]);

  const buff = safeSession("buff");

  return (
    <section
      className={[
        "bg-white rounded-2xl border shadow-sm text-emerald-900",
        compact ? "p-3" : "p-6",
        className,
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <h3 className={["font-semibold", compact ? "text-base" : "text-lg"].join(" ")}>Stats</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border">Lv {level}</span>
          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border">💰 {coins.toLocaleString()}</span>
        </div>
      </div>

      {/* XP Progress */}
      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <div className="text-xs text-emerald-900/70">XP</div>
          <div className="text-xs font-mono text-emerald-900/70">
            {xp.toLocaleString()} / {xpRange.nextMin.toLocaleString()}
          </div>
        </div>
        <ProgressBar value={xpRange.pct} label="To next level" />
      </div>

      {/* Needs grid */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Bar label="Happiness" value={clamp(Number(happiness), 0, 100)} />
        <Bar label="Energy" value={clamp(energy, 0, 100)} />
        <Bar label="Cleanliness" value={clamp(cleanliness, 0, 100)} />
        <Bar
          label="Hunger (lower is better)"
          value={hungerInverted}
          tooltip={`Raw hunger: ${hungerRaw}/100 (lower is better)`}
        />
      </div>

      {/* Session */}
      <div className="mt-4 text-xs text-emerald-900/70">
        {buff ? `Session Buff: ${buff}` : "No active session buffs."}
      </div>
    </section>
  );
}

/* ---------------- UI atoms ---------------- */

function Bar({ label, value = 0, tooltip }) {
  const v = clamp(Number(value) || 0, 0, 100);
  const color =
    v > 66 ? "bg-emerald-500"
      : v > 33 ? "bg-amber-400"
      : "bg-rose-500";

  const aria = `${label}: ${Math.round(v)} percent`;

  return (
    <div className="space-y-1" title={tooltip || aria}>
      <div className="text-xs text-emerald-900/70">{label}</div>
      <div
        className="h-3 bg-emerald-900/10 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(v)}
        aria-label={label}
        aria-valuetext={aria}
      >
        <div className={`h-full ${color} transition-[width] duration-300 ease-out`} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function ProgressBar({ value = 0, label }) {
  const v = clamp(Number(value) || 0, 0, 100);
  const color = v > 66 ? "bg-emerald-500" : v > 33 ? "bg-amber-400" : "bg-rose-500";
  const aria = label ? `${label}: ${Math.round(v)} percent` : `${Math.round(v)} percent`;
  return (
    <div
      className="w-full h-2 rounded bg-emerald-900/10 overflow-hidden"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      aria-valuetext={aria}
      title={aria}
    >
      <div className={`h-full ${color} transition-[width] duration-300 ease-out`} style={{ width: `${v}%` }} />
    </div>
  );
}

/* ---------------- utils ---------------- */

function levelXP(lv) {
  if (lv <= 1) return 0;
  // quadratic-ish climb; tune to your economy
  return Math.round(50 * (lv - 1) * (lv - 1) + 50 * (lv - 1));
}

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}

function safeSession(key) {
  try { return sessionStorage.getItem(key); } catch { return null; }
}
/* End of src/components/Features/StatsPanel.jsx */