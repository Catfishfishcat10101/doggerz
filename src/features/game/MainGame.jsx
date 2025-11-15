// src/features/game/MainGame.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  selectDog,
  feed as feedDog,
  play as playDog,
  bathe as batheDog,
  // goPotty as goPottyAction, // we'll wire a toast later
} from "@/redux/dogSlice.js";

import DogAIEngine from "@/features/game/DogAIEngine.jsx";

/* ---------- Small UI helpers ---------- */

function StatBar({ label, value = 0, color = "bg-emerald-500" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Pill({ label, value, tone = "default" }) {
  const toneClasses =
    tone === "danger"
      ? "bg-red-950/40 border-red-900 text-red-300"
      : tone === "warn"
      ? "bg-amber-950/40 border-amber-900 text-amber-200"
      : "bg-zinc-900/70 border-zinc-700 text-zinc-200";

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs ${toneClasses}`}
    >
      <span className="uppercase tracking-wide text-[0.65rem] text-zinc-400">
        {label}
      </span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

/* ---------- Age helper: months / years ---------- */

function formatAge(ageHours = 0) {
  const days = Math.floor(ageHours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years <= 0) {
    return `${months}mo`;
  }

  return `${years}y ${remainingMonths}mo`;
}

/* ---------- Main game screen ---------- */

export default function MainGame() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const [showHelp, setShowHelp] = useState(false);

  if (!dog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
        <p className="text-zinc-400 text-sm">Loading pup state…</p>
      </div>
    );
  }

  const {
    name = "Pup",
    level = 1,
    xp = 0,
    coins = 0, // keeping coins in state for later shop
    stats = {},
    poopCount = 0,
    pottyLevel = 0,
    pottyTrainingProgress = 0,
    isPottyTrained = false,
    isAsleep = false,
    ageHours = 0,
    condition = "clean",
    health = 100,
    isAlive = true,
    lifeStage = "puppy",
  } = dog;

  const {
    hunger = 0,
    happiness = 0,
    energy = 0,
    cleanliness = 0,
    thirst = 0,
  } = stats;

  const ageLabel = formatAge(ageHours);

  // condition pill
  let conditionLabel = "Clean";
  let conditionTone = "default";
  if (condition === "dirty") {
    conditionLabel = "Dirty";
    conditionTone = "warn";
  } else if (condition === "fleas") {
    conditionLabel = "Fleas";
    conditionTone = "warn";
  } else if (condition === "mange") {
    conditionLabel = "Mange";
    conditionTone = "danger";
  }

  const healthTone =
    health < 30 ? "danger" : health < 60 ? "warn" : "default";

  const pottyTrainedPct = Math.round(pottyTrainingProgress || 0);
  const pottyBadgeLabel = isPottyTrained ? "Potty trained" : "In training";

  // status text
  let statusLabel = "Awake";
  if (!isAlive) {
    statusLabel = "Has passed on";
  } else if (isAsleep) {
    statusLabel = "Sleeping (recharging)";
  } else if (hunger < 25) {
    statusLabel = "Hungry";
  } else if (cleanliness < 25) {
    statusLabel = "Needs a bath";
  } else if (happiness < 25) {
    statusLabel = "Bored";
  } else if (thirst < 25) {
    statusLabel = "Thirsty";
  }

  const lifeStageLabel =
    lifeStage === "adult"
      ? "Adult"
      : lifeStage === "senior"
      ? "Senior"
      : "Puppy";

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-50 flex flex-col">
      {/* headless engine for time drift + saving */}
      <DogAIEngine />

      {/* Top bar */}
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">
            Care dashboard
          </p>
          <p className="text-sm text-zinc-500">
            Keep {name}&apos;s hunger, happiness, energy, and cleanliness up
            over real time.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 text-sm">
          <div className="flex flex-wrap gap-2 justify-end">
            <Pill label="Level" value={level} />
            <Pill label="XP" value={Math.floor(xp)} />
            <Pill label="Age" value={ageLabel} />
            <Pill label="Stage" value={lifeStageLabel} />
            <Pill
              label="Condition"
              value={conditionLabel}
              tone={conditionTone}
            />
            <Pill
              label="Health"
              value={`${health.toFixed(0)}%`}
              tone={healthTone}
            />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row gap-8 px-6 py-6">
        {/* LEFT: dog + main actions */}
        <section className="flex-1 rounded-2xl border border-zinc-800 bg-gradient-to-b from-zinc-900/80 to-zinc-950 p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Pup
              </p>
              <p className="text-xl font-semibold">
                {name}{" "}
                {!isAlive && (
                  <span className="ml-2 text-xs text-red-400 uppercase tracking-wide">
                    Deceased
                  </span>
                )}
              </p>
            </div>
            <div className="flex flex-col items-end text-xs text-zinc-400">
              <span>Poops in yard: {poopCount}</span>
              <span>Potty trained: {pottyTrainedPct}%</span>
              <span>Status: {statusLabel}</span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="h-40 w-40 rounded-full border border-zinc-700 bg-zinc-900 flex items-center justify-center">
              <span className="text-xs text-zinc-400 text-center px-4">
                Dog sprite / yard scene goes here.
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => dispatch(feedDog())}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-semibold py-2.5 px-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!isAlive}
            >
              Feed
            </button>

            <button
              type="button"
              onClick={() => dispatch(playDog())}
              className="rounded-xl bg-sky-500 hover:bg-sky-400 text-zinc-950 text-sm font-semibold py-2.5 px-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!isAlive}
            >
              Play
            </button>

            <button
              type="button"
              onClick={() => dispatch(batheDog())}
              className="rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 text-sm font-semibold py-2.5 px-4 transition disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!isAlive}
            >
              Bathe
            </button>

            {/* no giant "Go potty" button – we'll do a toast later */}
          </div>
        </section>

        {/* RIGHT: meters + potty training + tips */}
        <section className="w-full lg:w-80 space-y-4">
          {/* core needs */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
            <p className="text-xs uppercase tracking-wide text-zinc-400 mb-3">
              Pup needs
            </p>
            <div className="space-y-3">
              <StatBar label="Hunger" value={hunger} color="bg-emerald-500" />
              <StatBar label="Happiness" value={happiness} color="bg-sky-500" />
              <StatBar label="Energy" value={energy} color="bg-violet-500" />
              <StatBar
                label="Cleanliness"
                value={cleanliness}
                color="bg-amber-400"
              />
              <StatBar label="Thirst" value={thirst} color="bg-cyan-400" />
            </div>
          </div>

          {/* potty training module */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-zinc-400">
                Potty training
              </p>
              <Pill
                label="Badge"
                value={pottyBadgeLabel}
                tone={isPottyTrained ? "default" : "warn"}
              />
            </div>
            <StatBar
              label="Progress"
              value={pottyTrainingProgress}
              color={isPottyTrained ? "bg-emerald-500" : "bg-amber-400"}
            />
            <p className="text-[0.7rem] text-zinc-500">
              Guide your pup to go outside when they really need to go. Each
              successful bathroom break raises this bar. At 100%, they earn a
              permanent potty-trained badge.
            </p>
          </div>

          {/* help card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 text-xs text-zinc-400 space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-zinc-200 text-sm">
                Need help?
              </p>
              <button
                type="button"
                onClick={() => setShowHelp((v) => !v)}
                className="rounded-full border border-zinc-600 px-3 py-1 text-[0.7rem] uppercase tracking-wide hover:border-emerald-400 hover:text-emerald-300 transition"
              >
                {showHelp ? "Hide tips" : "Show tips"}
              </button>
            </div>

            {showHelp && (
              <div className="space-y-1.5 mt-1">
                <p>• Feed periodically; don&apos;t let hunger drop too low.</p>
                <p>• Play to keep happiness up, but watch energy.</p>
                <p>
                  • Your pup will curl up and sleep automatically when energy
                  runs low, and slowly wake back up as they rest.
                </p>
                <p>
                  • Bathe before cleanliness falls too low to avoid fleas and
                  mange.
                </p>
                <p>
                  • Help them go potty outside; good habits raise the potty
                  training bar faster.
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
