// src/pages/Potty.jsx
import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

function clamp01(v) {
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(1, v));
}

export default function Potty() {
  const dog = useSelector(selectDog);
  const [sessionStep, setSessionStep] = useState(0);
  const [lastSessionNote, setLastSessionNote] = useState("");

  const {
    name = "Pup",
    pottyLevel = 0,
    poopCount = 0,
    stats = {},
  } = dog || {};

  const { hunger = 50, energy = 50, happiness = 50, cleanliness = 50 } = stats;

  // Normalize potty skill into 0–1 range for UI
  const pottySkill = useMemo(() => clamp01(pottyLevel / 100), [pottyLevel]);

  const pottyLabel = useMemo(() => {
    if (pottySkill <= 0.15) return "Total Rookie";
    if (pottySkill <= 0.4) return "Getting the Idea";
    if (pottySkill <= 0.75) return "Mostly Reliable";
    return "Potty Pro";
  }, [pottySkill]);

  const pottyDescription = useMemo(() => {
    if (pottySkill <= 0.15) {
      return "We’re at square one. Keep sessions short and super consistent.";
    }
    if (pottySkill <= 0.4) {
      return "Progress is happening. Expect wins mixed with a few accidents.";
    }
    if (pottySkill <= 0.75) {
      return "Your pup understands the rules. Now it’s all about routine.";
    }
    return "Rock-solid routine. Just maintain the schedule and praise.";
  }, [pottySkill]);

  // Totally fake “streak days” based on pottyLevel so it feels alive
  const dryStreakDays = useMemo(() => Math.floor(pottySkill * 10), [pottySkill]);

  // Simple “smart schedule” rough recommendation based on stats
  const recommendedMinutes = useMemo(() => {
    // Hunger high or cleanliness low -> shorter interval
    const pressureScore = (hunger + (100 - cleanliness)) / 200; // 0–1
    const base = 150; // 2.5 hours
    const min = 40; // don’t go below ~40 min
    const max = 240; // don’t go above 4 hours
    const raw = base - pressureScore * 60 - pottySkill * 30;
    return Math.round(Math.max(min, Math.min(max, raw)));
  }, [hunger, cleanliness, pottySkill]);

  const sessionSteps = [
    "Watch for sniffing, circling, or restlessness.",
    "Take your pup to the potty spot (outside or pad).",
    "Use a consistent cue phrase (like “Go potty”).",
    "Wait calmly and ignore distractions.",
    "When they go, shower them with praise + treats.",
  ];

  const handleAdvanceSession = () => {
    if (sessionStep < sessionSteps.length - 1) {
      setSessionStep((s) => s + 1);
      setLastSessionNote("");
    } else {
      setSessionStep(0);
      setLastSessionNote(
        "Session logged locally. In a future update, this will boost potty XP and reduce accidents."
      );
    }
  };

  const yardStatus =
    poopCount === 0
      ? "Clean yard — no poop on the ground."
      : poopCount === 1
      ? "There’s 1 poop in the yard. Time to scoop."
      : `There are ${poopCount} poops in the yard. Your pup’s union has some concerns.`;

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">
          Potty Training
        </h1>
        <p className="text-sm text-zinc-400">
          Dial in {name}&apos;s potty routine, cut down on accidents, and keep
          the yard clean.
        </p>
      </header>

      {/* Status + Yard overview */}
      <section className="grid gap-4 md:grid-cols-2">
        {/* Training Level Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 shadow-lg shadow-black/40">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Training Level
              </h2>
              <p className="text-lg font-bold text-zinc-50">
                {pottyLabel}{" "}
                <span className="text-xs font-normal text-zinc-500">
                  (Potty LVL {pottyLevel || 0})
                </span>
              </p>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <p>Dry streak</p>
              <p className="text-base font-semibold text-emerald-400">
                {dryStreakDays} day{dryStreakDays === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
              <span>0%</span>
              <span>100%</span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-800">
              <div
                className="h-full rounded-full bg-emerald-500 transition-[width] duration-500"
                style={{ width: `${pottySkill * 100}%` }}
              />
            </div>
          </div>

          <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
            {pottyDescription}
          </p>
        </div>

        {/* Yard / Accident Card */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 sm:p-5 shadow-lg shadow-black/40 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
                Yard &amp; Accident Overview
              </h2>
              <p className="text-lg font-bold text-zinc-50">
                {poopCount}{" "}
                <span className="text-sm font-normal text-zinc-400">
                  poops visible
                </span>
              </p>
            </div>
            <div className="text-right text-xs text-zinc-500">
              <p>Cleanliness</p>
              <p className="text-base font-semibold text-sky-400">
                {Math.round(cleanliness)} / 100
              </p>
            </div>
          </div>
          <p className="text-xs text-zinc-400">{yardStatus}</p>
          <p className="text-[11px] text-zinc-500">
            Scooping in the main game will sync with this view and keep the
            yard from turning into a landmine field.
          </p>
        </div>
      </section>

      {/* Smart schedule */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 sm:p-5 shadow-lg shadow-black/40 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
              Smart Potty Schedule
            </h2>
            <p className="text-xs text-zinc-400">
              Based on hunger, cleanliness, and training level.
            </p>
          </div>
          <div className="text-right text-xs text-zinc-500">
            <p>Suggested interval</p>
            <p className="text-base font-semibold text-amber-300">
              every {recommendedMinutes} min
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 text-xs">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3">
            <p className="font-semibold text-zinc-100">Morning</p>
            <p className="mt-1 text-zinc-400">
              First trip <span className="font-medium">within 10 minutes</span>{" "}
              of waking up. Reset the &quot;accident risk&quot; for the day.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3">
            <p className="font-semibold text-zinc-100">After Meals</p>
            <p className="mt-1 text-zinc-400">
              Take {name} out{" "}
              <span className="font-medium">10–20 minutes after eating</span>.{" "}
              Higher hunger now means higher pressure later.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3">
            <p className="font-semibold text-zinc-100">Before Bed</p>
            <p className="mt-1 text-zinc-400">
              One last potty break to protect your dry streak and your in-game
              floors.
            </p>
          </div>
        </div>
      </section>

      {/* Interactive training session */}
      <section className="rounded-2xl border border-emerald-900/70 bg-emerald-950/60 p-4 sm:p-5 shadow-lg shadow-black/40 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
              Run a Training Session
            </h2>
            <p className="text-xs text-emerald-200/80">
              Walk through a high-value potty session. Future update: this will
              hook into real XP.
            </p>
          </div>
          <span className="inline-flex items-center rounded-full border border-emerald-700 bg-emerald-900/60 px-3 py-1 text-[11px] font-medium text-emerald-100">
            Beta logic — UI only
          </span>
        </div>

        <ol className="space-y-2 text-xs text-emerald-50">
          {sessionSteps.map((step, idx) => {
            const isActive = idx === sessionStep;
            const isDone = idx < sessionStep;
            return (
              <li
                key={idx}
                className={`flex items-start gap-2 rounded-xl border px-3 py-2 ${
                  isActive
                    ? "border-emerald-400/80 bg-emerald-900/80"
                    : isDone
                    ? "border-emerald-800 bg-emerald-950/60 opacity-80"
                    : "border-emerald-950/80 bg-emerald-950/40 opacity-70"
                }`}
              >
                <span
                  className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full text-[10px] font-bold ${
                    isDone
                      ? "bg-emerald-500 text-emerald-950"
                      : isActive
                      ? "bg-emerald-400 text-emerald-950"
                      : "bg-emerald-950 text-emerald-500 border border-emerald-700"
                  }`}
                >
                  {isDone ? "✓" : idx + 1}
                </span>
                <span>{step}</span>
              </li>
            );
          })}
        </ol>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={handleAdvanceSession}
            className="inline-flex items-center justify-center rounded-full border border-emerald-400 bg-emerald-500/90 px-4 py-2 text-xs font-semibold text-emerald-950 shadow-sm shadow-emerald-900/70 hover:bg-emerald-400 active:scale-[0.98] transition"
          >
            {sessionStep < sessionSteps.length - 1
              ? "Next Step"
              : "Finish Session (UI only)"}
          </button>
          <p className="text-[11px] text-emerald-200/80">
            This flow is &quot;headless&quot; for now. Once the game economy is
            locked, we’ll wire it to real potty XP and streaks.
          </p>
        </div>

        {lastSessionNote && (
          <p className="text-[11px] text-emerald-200/80 border-t border-emerald-800/70 pt-2">
            {lastSessionNote}
          </p>
        )}
      </section>

      {/* Coach tips */}
      <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 sm:p-5 shadow-inner shadow-black/50">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
          Coach Notes
        </h2>
        <ul className="mt-2 space-y-1.5 text-xs text-zinc-400">
          <li>
            • In the main game,{" "}
            <span className="font-medium text-zinc-100">
              feeding + play sessions
            </span>{" "}
            should line up with potty breaks — less chaos, fewer accidents.
          </li>
          <li>
            • Use the{" "}
            <span className="font-medium text-zinc-100">Scoop Poop</span>{" "}
            action quickly after accidents to keep cleanliness and future potty
            XP happy.
          </li>
          <li>
            • When pottyLevel gets high, we can unlock{" "}
            <span className="font-medium text-zinc-100">
              “Ask to Go Out”
            </span>{" "}
            behaviors and advanced tricks.
          </li>
        </ul>
      </section>
    </div>
  );
}
