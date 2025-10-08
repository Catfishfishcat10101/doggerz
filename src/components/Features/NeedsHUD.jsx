// src/components/Features/NeedsHUD.jsx
import React, { useEffect, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { selectStats, selectMood, selectDog } from "@/redux/dogSlice";
import { selectWallet } from "@/redux/economySlice";

/** ---------- helpers ---------- */
function clamp(n) {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function formatEta(minutes) {
  if (!isFinite(minutes) || minutes < 0) return "—";
  if (minutes < 1) return `${Math.max(5, Math.round(minutes * 60 / 5) * 5)}s`;
  if (minutes < 60) return `${Math.round(minutes)}m`;
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  return m ? `${h}h ${m}m` : `${h}h`;
}

/**
 * Track a smoothed slope (percent per minute) for a numeric value.
 * We estimate from discrete updates and apply EMA to stabilize.
 */
function useSlopePerMinute(value, alpha = 0.35) {
  const last = useRef({ t: performance.now(), v: value });
  const ema = useRef(0);

  useEffect(() => {
    const now = performance.now();
    const dtMs = now - last.current.t;
    const dv = (value ?? 0) - (last.current.v ?? 0);
    if (dtMs > 250) {
      const perMin = (dv / dtMs) * 60000; // % per minute
      ema.current = alpha * perMin + (1 - alpha) * ema.current;
      last.current = { t: now, v: value ?? 0 };
    }
  }, [value, alpha]);

  return ema.current; // can be negative (decay) or positive (recovery)
}

/** ETA to hit target from current value given %/min slope */
function etaMinutes(current, target, slopePerMin) {
  const dv = target - current;
  if (slopePerMin === 0) return Infinity;
  const m = dv / slopePerMin;
  return m > 0 ? m : Infinity;
}

/** Compact label under each bar with ETA logic */
function Eta({ label, v, slope }) {
  // Default target bands: deplete to 25% if slope negative; recover to 90% if positive.
  const target = slope < 0 ? 25 : 90;
  const minutes = etaMinutes(v, target, slope);
  const text =
    !isFinite(minutes)
      ? "stable"
      : slope < 0
      ? `~${formatEta(minutes)} to ${target}%`
      : `~${formatEta(minutes)} to ${target}%`;
  return (
    <div className="text-[11px] text-white/60 mt-1">
      {label}: {text}
    </div>
  );
}

function Bar({ label, value, gradient = "from-emerald-400 to-cyan-400" }) {
  const v = clamp(value);
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 text-sm text-white/85">{label}</span>
      <div
        className="relative h-3 w-64 bg-white/10 rounded-full overflow-hidden border border-white/10"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={v}
        title={`${label}: ${v}%`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-[width] duration-400`}
          style={{ width: `${v}%` }}
        />
      </div>
      <span className="w-12 text-xs text-white/70 text-right tabular-nums">{v}%</span>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="px-2 py-0.5 rounded-full text-[11px] bg-white/10 border border-white/15 text-white/90">
      {children}
    </span>
  );
}

function LogoDoggerz({ className = "" }) {
  return (
    <div className={`select-none ${className}`} aria-label="Doggerz">
      <span className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white drop-shadow">
        Doggerz
      </span>
      <span className="ml-2 text-xs sm:text-sm text-white/70 align-super">No grind. Just vibes.</span>
    </div>
  );
}

/** ---------- component ---------- */
export default function NeedsHUD() {
  const stats = useSelector(selectStats) || { hunger: 0, energy: 0, fun: 0, hygiene: 0 };
  const mood = useSelector(selectMood) || "Neutral";
  const dog = useSelector(selectDog) || { name: "Your Pup", level: 1 };
  const { coins = 0, gems = 0 } = useSelector(selectWallet) || {};

  // learn slopes for ETAs
  const slopeHunger = useSlopePerMinute(stats.hunger);
  const slopeEnergy = useSlopePerMinute(stats.energy);
  const slopeFun = useSlopePerMinute(stats.fun);
  const slopeHygiene = useSlopePerMinute(stats.hygiene);

  const title = useMemo(
    () => `${dog?.name ?? "Your Pup"} • Lv.${dog?.level ?? 1}`,
    [dog?.name, dog?.level]
  );

  return (
    <aside
      className="
        p-5 rounded-3xl bg-white/5 backdrop-blur border border-white/10 shadow-2xl
        max-w-[32rem] w-full
      "
      aria-label="Needs HUD"
    >
      {/* Brand + header */}
      <div className="mb-4 flex items-start justify-between">
        <LogoDoggerz className="mr-3" />
        <div className="text-right">
          <div className="text-white font-semibold text-base sm:text-lg">{title}</div>
          <div className="mt-1 flex items-center justify-end gap-2">
            <Pill>{mood}</Pill>
            <Pill>Auto-simulated</Pill>
          </div>
        </div>
      </div>

      {/* Bars + ETAs */}
      <div className="space-y-4">
        <div>
          <Bar label="Hunger" value={stats.hunger} gradient="from-rose-400 to-orange-400" />
          <Eta label="Hunger" v={stats.hunger} slope={slopeHunger} />
        </div>
        <div>
          <Bar label="Energy" value={stats.energy} gradient="from-yellow-300 to-lime-400" />
          <Eta label="Energy" v={stats.energy} slope={slopeEnergy} />
        </div>
        <div>
          <Bar label="Fun" value={stats.fun} gradient="from-sky-400 to-indigo-400" />
          <Eta label="Fun" v={stats.fun} slope={slopeFun} />
        </div>
        <div>
          <Bar label="Hygiene" value={stats.hygiene} gradient="from-fuchsia-400 to-pink-400" />
          <Eta label="Hygiene" v={stats.hygiene} slope={slopeHygiene} />
        </div>
      </div>

      {/* Wallet */}
      <div className="mt-5 flex items-center gap-3 text-white/90">
        <div className="flex items-center gap-1 px-2 py-1 rounded border border-yellow-400/40 bg-yellow-400/10">
          <span className="text-sm leading-none">🪙</span>
          <span className="text-xs tabular-nums">{coins}</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded border border-fuchsia-400/40 bg-fuchsia-400/10">
          <span className="text-sm leading-none">💎</span>
          <span className="text-xs tabular-nums">{gems}</span>
        </div>
      </div>
    </aside>
  );
}
