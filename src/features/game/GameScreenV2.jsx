// src/features/game/GameScreenV2.jsx
// Hybrid UI: minimal + pixel pet + sleek HUD + warm pet sim

import React from "react";

/**
 * @typedef {Object} Needs
 * @property {number} hunger
 * @property {number} happiness
 * @property {number} energy
 * @property {number} cleanliness
 */

/**
 * @typedef {Object} PottyInfo
 * @property {number} gauge      // 0-100
 * @property {string} statusText // e.g. "All good"
 * @property {string} cleanlinessTier // e.g. "Fresh"
 * @property {string} yardStatus // e.g. "Yard is spotless"
 */

/**
 * @typedef {Object} TrainingInfo
 * @property {string} streakLabel    // e.g. "1 day streak"
 * @property {string} lastSession    // e.g. "Nov 23, 2025"
 * @property {string} lastPenalty    // e.g. "—" or "Missed yesterday"
 * @property {number} sit
 * @property {number} stay
 * @property {number} rollOver
 * @property {number} speak
 */

function clamp(v) {
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, Math.round(v)));
}

function NeedBar({ label, value }) {
  const v = clamp(value);
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-medium text-zinc-300 w-16 tracking-tight">
        {label}
      </span>
      <div className="flex-1 h-2.5 rounded-full bg-zinc-900/80 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-400/90 shadow-[0_0_12px_rgba(52,211,153,0.6)] transition-all"
          style={{ width: `${v}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-zinc-400 w-8 text-right">
        {v}%
      </span>
    </div>
  );
}

function SkillBar({ label, value }) {
  const v = clamp(value);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[11px] text-zinc-300 font-medium">
        <span>{label}</span>
        <span className="font-mono text-zinc-400">{v}/100</span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-900/80 overflow-hidden">
        <div
          className="h-full rounded-full bg-sky-400/90 shadow-[0_0_12px_rgba(56,189,248,0.7)] transition-all"
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full border border-emerald-500/40 bg-emerald-500/5 text-[10px] font-mono uppercase tracking-[0.12em] text-emerald-200/90">
      {children}
    </span>
  );
}

/**
 * Main hybrid UI game screen
 */
export default function GameScreenV2({
  dogName = "Pup",
  lifeStageLabel = "PUPPY",
  lifeStageDay = 1,
  moodLabel = "Content",
  coins = 0,
  level = 1,
  needs = /** @type {Needs} */ ({
    hunger: 50,
    happiness: 50,
    energy: 50,
    cleanliness: 50,
  }),
  potty = /** @type {PottyInfo} */ ({
    gauge: 3,
    statusText: "All good",
    cleanlinessTier: "Fresh",
    yardStatus: "Yard is spotless",
  }),
  training = /** @type {TrainingInfo} */ ({
    streakLabel: "1 day streak",
    lastSession: "Today",
    lastPenalty: "—",
    sit: 10,
    stay: 5,
    rollOver: 0,
    speak: 0,
  }),
  // action handlers (wire these from MainGame.jsx)
  onFeed,
  onPlay,
  onBathe,
  onPottyWalk,
  onScoopYard,
  onTrain, // (mode) => void, e.g. "mic" or "manual"
  renderDogSprite, // optional render-prop for your EnhancedDogSprite
}) {
  const { hunger, happiness, energy, cleanliness } = needs;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-6 pb-10">
        {/* TOP HUD */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          {/* Left: Dog identity */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-emerald-300 drop-shadow-[0_0_18px_rgba(52,211,153,0.7)]">
                {dogName || "Your Pup"}
              </h1>
              <Pill>{lifeStageLabel}</Pill>
              <span className="text-[11px] font-mono text-zinc-400">
                Day {lifeStageDay}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-zinc-400">
              <span className="font-mono uppercase tracking-[0.18em]">
                Mood:{" "}
                <span className="text-emerald-200 font-semibold">
                  {moodLabel}
                </span>
              </span>
              <span className="h-1 w-1 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              <span className="font-mono uppercase tracking-[0.18em] text-zinc-500">
                Doggerz • Virtual Pup
              </span>
            </div>
          </div>

          {/* Right: coins + level */}
          <div className="flex items-center gap-3">
            <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 shadow-lg shadow-emerald-500/10">
              <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500 font-mono">
                Coins
              </div>
              <div className="text-sm font-semibold text-amber-300 font-mono">
                {coins.toLocaleString()}
              </div>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-emerald-500/60 shadow-lg shadow-emerald-500/20">
              <div className="text-[10px] uppercase tracking-[0.18em] text-emerald-300 font-mono">
                Level
              </div>
              <div className="text-lg font-semibold text-emerald-200 font-mono">
                {level}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN GRID: dog stage + side cards */}
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] gap-6">
          {/* Dog yard + needs + actions */}
          <div className="space-y-4">
            {/* Yard / Stage */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-950 shadow-[0_30px_80px_rgba(0,0,0,0.9)]">
              {/* Pixel frame accent */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-[1px] border border-emerald-500/10 rounded-[22px] mix-blend-screen" />
                <div className="absolute -top-16 left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute -bottom-24 right-0 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
              </div>

              {/* Yard text strip */}
              <div className="flex items-center justify-between px-4 pt-3 pb-2 text-[11px] font-mono text-zinc-400 border-b border-slate-800/70 bg-slate-950/70">
                <span className="uppercase tracking-[0.2em]">
                  Yard •{" "}
                  <span className="text-emerald-300/90">Late evening</span>
                </span>
                <span className="uppercase tracking-[0.2em] text-zinc-500">
                  Life doesn&apos;t pause • You do
                </span>
              </div>

              {/* Dog area */}
              <div className="relative flex items-center justify-center px-4 pt-6 pb-4">
                <div className="h-64 w-full max-w-xl rounded-2xl bg-gradient-to-b from-slate-800/80 via-slate-900/90 to-slate-950 border border-slate-700/80 shadow-inner shadow-black/80 flex items-center justify-center">
                  {typeof renderDogSprite === "function" ? (
                    renderDogSprite()
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center border border-slate-600/80">
                      <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-[0.18em]">
                        Dog Sprite
                      </span>
                    </div>
                  )}
                </div>

                {/* Needs HUD bubble */}
                <div className="absolute right-4 top-4 w-56 rounded-2xl border border-slate-700/80 bg-slate-950/95/90 backdrop-blur-sm p-3 shadow-xl shadow-emerald-500/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-zinc-500">
                      Daily care
                    </span>
                    <span className="text-[10px] font-mono text-emerald-300/90">
                      Auto-decay active
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <NeedBar label="Hunger" value={hunger} />
                    <NeedBar label="Energy" value={energy} />
                    <NeedBar label="Happy" value={happiness} />
                    <NeedBar label="Clean" value={cleanliness} />
                  </div>
                </div>
              </div>
            </div>

            {/* Action bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={onFeed}
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-100 hover:bg-emerald-500/20 hover:border-emerald-400/80 transition-all shadow-lg shadow-emerald-500/10"
              >
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase">
                  Feed
                </span>
                <span className="text-[11px] text-emerald-200/90">
                  +Hunger • +Happy
                </span>
              </button>

              <button
                type="button"
                onClick={onPlay}
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl border border-sky-500/40 bg-sky-500/10 px-3 py-2 text-xs font-medium text-sky-100 hover:bg-sky-500/20 hover:border-sky-400/80 transition-all shadow-lg shadow-sky-500/10"
              >
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase">
                  Play
                </span>
                <span className="text-[11px] text-sky-100/90">
                  +Happy • +Bond
                </span>
              </button>

              <button
                type="button"
                onClick={onBathe}
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-100 hover:bg-cyan-500/20 hover:border-cyan-300/80 transition-all shadow-lg shadow-cyan-500/10"
              >
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase">
                  Bathe
                </span>
                <span className="text-[11px] text-cyan-100/90">
                  +Clean • -Potty risk
                </span>
              </button>

              <button
                type="button"
                onClick={onPottyWalk}
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl border border-amber-400/40 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-100 hover:bg-amber-500/20 hover:border-amber-300/80 transition-all shadow-lg shadow-amber-500/10"
              >
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase">
                  Potty walk
                </span>
                <span className="text-[11px] text-amber-100/90">
                  Resets gauge
                </span>
              </button>

              <button
                type="button"
                onClick={onScoopYard}
                className="group flex flex-col items-center justify-center gap-1 rounded-2xl border border-zinc-600/60 bg-zinc-900/80 px-3 py-2 text-xs font-medium text-zinc-100 hover:bg-zinc-800 hover:border-zinc-400 transition-all shadow-lg shadow-black/40"
              >
                <span className="font-mono text-[10px] tracking-[0.16em] uppercase">
                  Scoop yard
                </span>
                <span className="text-[11px] text-zinc-300/90">
                  Keeps tier high
                </span>
              </button>
            </div>
          </div>

          {/* Right column: Potty + Training */}
          <div className="space-y-4">
            {/* Potty / Yard card */}
            <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-950/95 via-slate-950 to-slate-950 shadow-[0_24px_60px_rgba(0,0,0,0.9)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-amber-300/80">
                    Potty tracker
                  </div>
                  <div className="text-[11px] text-amber-100/90">
                    {potty.statusText}
                  </div>
                </div>
                <Pill>Gauge {clamp(potty.gauge)}%</Pill>
              </div>

              <div className="mb-3 h-1.5 rounded-full bg-slate-900/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400/90 shadow-[0_0_14px_rgba(251,191,36,0.9)] transition-all"
                  style={{ width: `${clamp(potty.gauge)}%` }}
                />
              </div>

              <div className="space-y-1.5 text-[11px] text-zinc-200">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Cleanliness tier</span>
                  <span className="font-mono text-emerald-300/90">
                    {potty.cleanlinessTier}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Yard status</span>
                  <span className="font-mono text-zinc-200">
                    {potty.yardStatus}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onScoopYard}
                  className="inline-flex items-center gap-2 rounded-2xl border border-amber-400/70 bg-amber-500/15 px-3 py-1.5 text-[11px] font-medium text-amber-100 hover:bg-amber-500/25 hover:border-amber-300 transition-all font-mono uppercase tracking-[0.16em]"
                >
                  Scoop yard now
                </button>
              </div>
            </div>

            {/* Training card */}
            <div className="rounded-3xl border border-sky-500/40 bg-gradient-to-b from-slate-950/95 via-slate-950 to-slate-950 shadow-[0_26px_70px_rgba(0,0,0,0.9)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs font-mono uppercase tracking-[0.2em] text-sky-300/90">
                    Obedience training
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    Log one clean session per day to grow the streak.
                  </div>
                </div>
                <div className="text-right">
                  <Pill>{training.streakLabel}</Pill>
                  <div className="mt-1 text-[11px] text-zinc-500 font-mono">
                    Last: {training.lastSession}
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 mb-3">
                <SkillBar label="Sit" value={training.sit} />
                <SkillBar label="Stay" value={training.stay} />
                <SkillBar label="Roll over" value={training.rollOver} />
                <SkillBar label="Speak" value={training.speak} />
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 mb-3">
                <span className="font-mono">
                  Penalty: {training.lastPenalty || "—"}
                </span>
                <span className="font-mono text-zinc-400">
                  Each session boosts mood + coins.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => onTrain && onTrain("mic")}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-400/80 bg-sky-500/20 px-3 py-2 text-[12px] font-semibold text-sky-50 hover:bg-sky-400/30 hover:border-sky-300 transition-all shadow-lg shadow-sky-500/25"
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.9)]" />
                  Start voice training
                </button>
                <button
                  type="button"
                  onClick={() => onTrain && onTrain("manual")}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 px-3 py-2 text-[11px] font-mono text-zinc-300 hover:bg-slate-800 hover:border-slate-500 transition-all"
                >
                  Log manual session
                </button>
              </div>

              <div className="mt-2 text-[10px] text-zinc-500 font-mono">
                Waiting for microphone? No problem — log training manually and
                keep your streak alive.
              </div>
            </div>
          </div>
        </div>

        {/* Footer strip */}
        <div className="mt-6 flex items-center justify-between text-[10px] text-zinc-500 font-mono uppercase tracking-[0.2em]">
          <span>© {new Date().getFullYear()} Doggerz. Created by William Johnson.</span>
          <span>Game screen v2 • UI hybrid 1+2+3+4</span>
        </div>
      </div>
    </div>
  );
}