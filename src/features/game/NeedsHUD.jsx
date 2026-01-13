// src/features/game/NeedsHUD.jsx
// @ts-nocheck

import { useSelector } from "react-redux";
import React, { useEffect, useRef, useState } from "react";
import {
  selectDog,
  selectDogTraining,
  selectDogBond,
  selectDogMoodlets,
  selectDogEmotionCue,
} from "@/redux/dogSlice.js";

const StatBar = React.memo(function StatBar({
  label,
  value = 0,
  color = "bg-emerald-500",
}) {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : 0;
  const pct = Math.max(0, Math.min(100, numeric));
  const glow =
    color === "bg-sky-500"
      ? "shadow-[0_0_18px_rgba(56,189,248,0.22)]"
      : color === "bg-violet-500"
        ? "shadow-[0_0_18px_rgba(139,92,246,0.20)]"
        : color === "bg-amber-400"
          ? "shadow-[0_0_18px_rgba(251,191,36,0.18)]"
          : "shadow-[0_0_18px_rgba(16,185,129,0.18)]";
  const [pulse, setPulse] = useState(false);
  const prevPct = useRef(pct);
  useEffect(() => {
    if (prevPct.current !== pct) {
      setPulse(true);
      const timeout = setTimeout(() => setPulse(false), 350);
      prevPct.current = pct;
      return () => clearTimeout(timeout);
    }
  }, [pct]);
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-zinc-300/80">
        <span className="uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </span>
        <span className="font-semibold text-zinc-200">{pct.toFixed(0)}%</span>
      </div>
      <div
        className="h-2.5 rounded-full bg-black/35 border border-white/10 overflow-hidden"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        tabIndex={0}
      >
        <div
          className={`h-full ${color} ${glow} transition-all duration-700 ease-out${pulse ? " animate-pulse-bar" : ""}`}
          style={{
            width: `${pct}%`,
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.0))",
          }}
        ></div>
      </div>
    </div>
  );
});

function Pill({ label, value, tone = "default" }) {
  const toneClasses =
    tone === "danger"
      ? "bg-red-500/10 border-red-500/25 text-red-200"
      : tone === "warn"
        ? "bg-amber-500/10 border-amber-500/25 text-amber-100"
        : "bg-black/25 border-white/15 text-zinc-100";
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${toneClasses}`}
    >
      <span className="uppercase tracking-wide text-[0.65rem] text-zinc-300/70">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

const NeedsHUD = React.memo(function NeedsHUD() {
  const dog = useSelector(selectDog);
  const training = useSelector(selectDogTraining);
  const bond = useSelector(selectDogBond);
  const moodlets = useSelector(selectDogMoodlets);
  const emotionCue = useSelector(selectDogEmotionCue);
  const [cuePulse, setCuePulse] = useState(false);
  const [ariaCue, setAriaCue] = useState("");
  const prevCue = useRef(emotionCue);
  useEffect(() => {
    const hasCue =
      typeof emotionCue === "string"
        ? emotionCue.trim().length > 0
        : Boolean(emotionCue);
    if (hasCue && prevCue.current !== emotionCue) {
      setCuePulse(true);
      setAriaCue(`Dog emotion: ${emotionCue}`);
      // Play gentle sound (optional, requires public/audio/ui-cue.mp3 or similar)
      const audio = new Audio("/audio/ui-cue.mp3");
      audio.play().catch(() => {});
      const timeout = setTimeout(() => setCuePulse(false), 400);
      const ariaTimeout = setTimeout(() => setAriaCue(""), 1200);
      prevCue.current = emotionCue;
      return () => {
        clearTimeout(timeout);
        clearTimeout(ariaTimeout);
      };
    }
  }, [emotionCue]);
  if (!dog) return null;
  const stats = dog.stats || {};
  const hungerLevel = Math.round(stats.hunger ?? 0);
  const food = Math.max(0, Math.min(100, 100 - hungerLevel));
  const happiness = Math.round(stats.happiness ?? 0);
  const energy = Math.round(stats.energy ?? 0);
  const cleanliness = Math.round(stats.cleanliness ?? 0);
  const bondValue = Math.round(bond?.value ?? 0);
  const pottyTraining = training?.potty || {};
  const pottyGoal = pottyTraining.goal || 0;
  const pottySuccess = pottyTraining.successCount || 0;
  const pottyTrainingComplete = Boolean(pottyTraining.completedAt);
  const pottyTrainingProgress = pottyTrainingComplete
    ? 100
    : pottyGoal
      ? Math.min(100, Math.round((pottySuccess / pottyGoal) * 100))
      : 0;
  return (
    <section className="rounded-3xl border border-white/15 bg-black/35 backdrop-blur-md p-4 shadow-[0_0_60px_rgba(0,0,0,0.18)] space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">
            Pup needs
          </p>
          <p className="mt-0.5 text-sm font-extrabold text-emerald-200">
            Status
          </p>
        </div>
        {/* Neon green/black theme, pulse-glowing DOGGERZ */}
        <span
          className="ml-2 px-3 py-1 rounded-full border border-emerald-400/40 bg-black/80 text-emerald-300 font-extrabold text-lg tracking-widest shadow-[0_0_18px_#00ffae99] animate-pulse-bar select-none"
          style={{ textShadow: "0 0 8px #00ffae, 0 0 2px #00ffae" }}
        >
          DOGGERZ
        </span>
        {/* Show current emotion cue as a badge */}
        {emotionCue ? (
          <span
            className={`ml-2 inline-flex items-center rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-200 animate-fadein focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/80 transition-all duration-200 shadow-sm hover:scale-[1.04] active:scale-95 cursor-pointer${cuePulse ? " ring-4 ring-emerald-300/60" : ""}`}
            title={emotionCue}
            tabIndex={0}
            aria-label={`Dog emotion: ${emotionCue}`}
            role="status"
            aria-live="polite"
          >
            <span aria-hidden="true">
              {emotionCue.charAt(0).toUpperCase() + emotionCue.slice(1)}
            </span>
          </span>
        ) : null}
        {/* ARIA live region for screen readers */}
        <span
          aria-live="polite"
          style={{ position: "absolute", left: "-9999px" }}
        >
          {ariaCue}
        </span>
      </div>
      {moodlets && moodlets.length > 0 ? (
        <MoodletChips moodlets={moodlets} />
      ) : null}
      <div className="space-y-3">
        <StatBar label="Food" value={food} color="bg-emerald-500" />
        <StatBar label="Happiness" value={happiness} color="bg-sky-500" />
        <StatBar label="Energy" value={energy} color="bg-violet-500" />
        <StatBar label="Cleanliness" value={cleanliness} color="bg-amber-400" />
        <StatBar label="Bond" value={bondValue} color="bg-rose-400" />
      </div>
      {!pottyTrainingComplete ? (
        <div className="mt-3 border-t border-white/10 pt-3 text-xs text-zinc-300/80 space-y-2">
          <div className="flex items-center justify-between">
            <p className="uppercase tracking-wide text-[0.65rem]">
              Potty training
            </p>
            <Pill
              label="Status"
              value={pottyTrainingProgress >= 99 ? "Almost" : "In training"}
              tone={pottyTrainingProgress >= 99 ? "default" : "warn"}
            />
          </div>
          <div className="mt-1">
            <div
              className="h-2 rounded-full bg-black/35 border border-white/10 overflow-hidden"
              role="progressbar"
              aria-valuenow={Math.max(0, Math.min(100, pottyTrainingProgress))}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Potty training progress"
              tabIndex={0}
            >
              <div
                className="h-full bg-emerald-500 transition-all duration-700 ease-out"
                style={{
                  width: `${Math.max(0, Math.min(100, pottyTrainingProgress))}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-[0.7rem] text-zinc-400/80 mt-1">
              <span>Progress</span>
              <span>{Math.round(pottyTrainingProgress || 0)}%</span>
            </div>
          </div>
          {pottyGoal > 0 ? (
            <p className="text-[0.65rem] text-zinc-300/80">
              {pottySuccess}/{pottyGoal} successful breaks logged.
            </p>
          ) : (
            <p className="text-[0.65rem] text-zinc-400/80">
              Start potty training from the Potty page to unlock trick training.
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
});

function MoodletChips({ moodlets }) {
  const [popoverIdx, setPopoverIdx] = useState(null);
  const popoverRef = useRef();
  useEffect(() => {
    if (popoverIdx === null) return;
    function handle(e) {
      if (popoverRef.current && !popoverRef.current.contains(e.target))
        setPopoverIdx(null);
    }
    document.addEventListener("mousedown", handle);
    document.addEventListener("focusin", handle);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("focusin", handle);
    };
  }, [popoverIdx]);
  return (
    <div
      className="flex flex-wrap gap-2 mt-1"
      role="list"
      aria-label="Dog moodlets"
    >
      {moodlets.map((m, i) => {
        let tone = "info";
        if (["sick", "injured", "starving", "fear"].includes(m.type))
          tone = "danger";
        else if (["hungry", "tired", "dirty", "bored"].includes(m.type))
          tone = "warn";
        else if (["happy", "playful", "excited", "loved"].includes(m.type))
          tone = "happy";
        const toneClasses =
          tone === "danger"
            ? "bg-red-500/10 border-red-500/25 text-red-200"
            : tone === "warn"
              ? "bg-amber-500/10 border-amber-500/25 text-amber-100"
              : tone === "happy"
                ? "bg-emerald-500/10 border-emerald-400/25 text-emerald-100"
                : "bg-sky-500/10 border-sky-400/20 text-sky-100";
        const showPopover = popoverIdx === i;
        return (
          <span
            key={m.type + i}
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] animate-fadein transition-all duration-200 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/80 hover:scale-[1.06] active:scale-95 cursor-pointer ${toneClasses}`}
            title={m.source ? `${m.type}: ${m.source}` : m.type}
            tabIndex={0}
            aria-label={`Moodlet: ${m.type}${m.intensity > 1 ? `, intensity ${m.intensity}` : ""}${m.source ? ", source: " + m.source : ""}`}
            role="listitem"
            onClick={() => setPopoverIdx(showPopover ? null : i)}
            onFocus={() => setPopoverIdx(i)}
            onBlur={() =>
              setTimeout(
                () => setPopoverIdx((idx) => (idx === i ? null : idx)),
                100
              )
            }
            aria-haspopup="dialog"
            aria-expanded={showPopover}
          >
            <span aria-hidden="true">
              {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
            </span>
            {m.intensity > 1 ? (
              <span aria-hidden="true">{` ×${m.intensity}`}</span>
            ) : null}
            {showPopover && (
              <span
                ref={popoverRef}
                className="absolute z-30 mt-8 left-1/2 -translate-x-1/2 min-w-[180px] max-w-xs rounded-xl border border-white/15 bg-zinc-900/95 p-3 shadow-xl text-xs text-zinc-100 animate-fadein"
                role="dialog"
                aria-modal="false"
                tabIndex={-1}
              >
                <div className="font-bold mb-1 text-emerald-200">
                  {m.type.charAt(0).toUpperCase() + m.type.slice(1)}{" "}
                  {m.intensity > 1 ? `×${m.intensity}` : ""}
                </div>
                {m.source && (
                  <div className="mb-1">
                    <span className="text-zinc-400">Source:</span> {m.source}
                  </div>
                )}
                {m.duration != null && (
                  <div className="mb-1">
                    <span className="text-zinc-400">Duration:</span>{" "}
                    {m.duration}s
                  </div>
                )}
                {m.effect && (
                  <div className="mb-1">
                    <span className="text-zinc-400">Effect:</span> {m.effect}
                  </div>
                )}
                <div className="mt-1 text-right">
                  <button
                    className="text-xs text-emerald-300 hover:underline"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopoverIdx(null);
                    }}
                  >
                    Close
                  </button>
                </div>
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default NeedsHUD;
