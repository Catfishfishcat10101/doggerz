// src/components/Features/StatsPanel.jsx
import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import * as dog from "../../redux/dogSlice";

/**
 * StatsPanel
 * - Pulls from Redux selectors if they exist; otherwise uses safe fallbacks.
 * - XP progress bar (estimates if xp selectors are missing).
 * - Happiness/Energy meters with color zones.
 * - Coins with a mini sparkline persisted in localStorage.
 * - Session snapshot (owned accessories, yard skin, buff).
 */

function useSafeSelector(selector, fallback) {
  // If a selector is provided, use it; otherwise use a stable fallback function.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const sel = selector || (() => fallback);
  return useSelector(sel);
}

function clamp01(v) {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

/* --------- tiny sparkline persisted in localStorage --------- */
function useCoinSeries(coins, maxPoints = 40) {
  const key = "doggerz:coinsSeries";
  const [series, setSeries] = React.useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [Number(coins || 0)];
    } catch {
      return [Number(coins || 0)];
    }
  });

  useEffect(() => {
    const next = [...series, Number(coins || 0)].slice(-maxPoints);
    setSeries(next);
    try {
      localStorage.setItem(key, JSON.stringify(next));
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coins]);

  return series;
}

/* ----------------------------- UI bits ----------------------------- */
function StatCard({ title, value, sub, children }) {
  return (
    <div className="card p-4">
      <div className="text-sm opacity-70">{title}</div>
      <div className="mt-1 text-2xl font-semibold">{value}</div>
      {sub && <div className="text-xs opacity-70">{sub}</div>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function ProgressBar({ pct, label, color = "#0ea5e9" }) {
  const p = clamp01(pct);
  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full transition-[width] duration-300 ease-out"
          style={{ width: `${Math.round(p * 100)}%`, background: color }}
          aria-hidden
        />
      </div>
      {label && (
        <div className="mt-1 text-xs opacity-70">
          {label} — {Math.round(p * 100)}%
        </div>
      )}
    </div>
  );
}

function Sparkline({ data = [], className = "" }) {
  const w = 160, h = 36, pad = 2;
  const points = data.length ? data : [0];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(1, max - min);
  const step = (w - pad * 2) / Math.max(1, points.length - 1);
  const d = points
    .map((v, i) => {
      const x = pad + i * step;
      const y = h - pad - ((v - min) / span) * (h - pad * 2);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={className} aria-hidden>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.85" />
    </svg>
  );
}

/* ----------------------------- Component ----------------------------- */
export default function StatsPanel() {
  // Try Redux selectors first; fall back if your slice doesn’t expose them yet.
  const level = useSafeSelector(dog.selectDogLevel, 1);
  const coins = useSafeSelector(dog.selectCoins, 0);
  const accessories = useSafeSelector(dog.selectAccessories, { owned: [] });

  // Optional selectors (if your slice has them)
  const happiness = useSafeSelector(dog.selectHappiness, 0.66); // 0..1
  const energy = useSafeSelector(dog.selectEnergy, 0.6);        // 0..1
  const xp = useSafeSelector(dog.selectXp, null);               // current xp
  const xpToNext = useSafeSelector(dog.selectXpToNext, null);   // required xp

  // XP model fallback: quadratic-ish per level (clean and predictable)
  const fallbackNeeded = 50 + Math.floor(level ** 1.5 * 25);
  const currXp = Number(xp ?? Math.min(fallbackNeeded, Math.floor(coins / 2))); // tie to coins loosely if xp absent
  const needXp = Number(xpToNext ?? fallbackNeeded);
  const xpPct = clamp01(currXp / Math.max(1, needXp));

  // Color zones for bars
  const happyColor = happiness > 0.66 ? "#10b981" : happiness > 0.33 ? "#f59e0b" : "#ef4444";
  const energyColor = energy > 0.66 ? "#22d3ee" : energy > 0.33 ? "#f59e0b" : "#ef4444";

  // Coin series sparkline (persists in localStorage)
  const series = useCoinSeries(coins);

  const ownedCount = accessories?.owned?.length ?? 0;
  const yardSkin = (() => {
    try { return JSON.parse(sessionStorage.getItem("yardSkin") ?? "\"default\""); } catch { return "default"; }
  })();
  const buff = (() => {
    try { return JSON.parse(sessionStorage.getItem("buff") ?? "null"); } catch { return null; }
  })();

  // Derived labels
  const moodLabel = happiness > 0.8 ? "Ecstatic" : happiness > 0.6 ? "Happy" : happiness > 0.4 ? "Content" : happiness > 0.2 ? "Restless" : "Sad";
  const energyLabel = energy > 0.8 ? "Energized" : energy > 0.6 ? "Good" : energy > 0.4 ? "Okay" : energy > 0.2 ? "Tired" : "Exhausted";

  // Smooth announce on updates (SR-friendly)
  useEffect(() => {
    const msg = `Level ${level}, ${coins} coins, happiness ${Math.round(happiness * 100)} percent, energy ${Math.round(energy * 100)} percent.`;
    try {
      const id = "doggerz-stats-live";
      let el = document.getElementById(id);
      if (!el) {
        el = document.createElement("div");
        el.id = id;
        el.className = "sr-only";
        document.body.appendChild(el);
      }
      el.textContent = msg;
    } catch {}
  }, [level, coins, happiness, energy]);

  return (
    <div className="p-6 container">
      <h1 className="text-xl font-semibold">Stats</h1>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {/* Level / XP */}
        <StatCard
          title="Level"
          value={level}
          sub={`${currXp}/${needXp} XP to next`}
        >
          <ProgressBar pct={xpPct} color="#0ea5e9" label="XP Progress" />
        </StatCard>

        {/* Happiness */}
        <StatCard
          title="Happiness"
          value={`${Math.round(happiness * 100)}%`}
          sub={moodLabel}
        >
          <ProgressBar pct={happiness} color={happyColor} />
        </StatCard>

        {/* Energy */}
        <StatCard
          title="Energy"
          value={`${Math.round(energy * 100)}%`}
          sub={energyLabel}
        >
          <ProgressBar pct={energy} color={energyColor} />
        </StatCard>

        {/* Coins */}
        <StatCard title="Coins" value={coins} sub="Balance">
          <div className="mt-1 text-slate-500 dark:text-slate-400">
            <Sparkline data={series} />
          </div>
        </StatCard>

        {/* Inventory */}
        <StatCard title="Accessories" value={ownedCount} sub="Owned" />

        {/* Session */}
        <StatCard title="Session" value={buff ? "Buff Active" : "No Buff"}>
          <div className="text-xs opacity-70">
            Yard: <b>{yardSkin}</b>
          </div>
        </StatCard>
      </div>

      {/* Tips / next actions */}
      <div className="mt-6 card p-4">
        <div className="text-sm opacity-80">
          Pro tip: keep <b>happiness</b> above 70% to gain a +10% XP multiplier on trick training. Drop below 30% and coin rewards taper.
        </div>
      </div>
    </div>
  );
}
      window.removeEventListener("beforeunload", onHide);
      window.removeEventListener("offline", onOffline);
    