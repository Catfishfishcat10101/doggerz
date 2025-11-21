// src/features/game/NeedsHUD.jsx
// @ts-nocheck

import React from "react";
import { useSelector } from "react-redux";
import {
  selectDog,
  selectDogTraining,
  selectDogCleanlinessTier,
} from "@/redux/dogSlice.js";

function StatBar({ label, value = 0, color = "bg-emerald-500" }) {
  const numeric = Number.isFinite(Number(value)) ? Number(value) : 0;
  const pct = Math.max(0, Math.min(100, numeric));

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

export default function NeedsHUD() {
  const dog = useSelector(selectDog);
  const training = useSelector(selectDogTraining);
  const cleanlinessTier = useSelector(selectDogCleanlinessTier);

  if (!dog) return null;

  const stats = dog.stats || {};
  const hunger = Math.round(stats.hunger ?? 0);
  const happiness = Math.round(stats.happiness ?? 0);
  const energy = Math.round(stats.energy ?? 0);
  const cleanliness = Math.round(stats.cleanliness ?? 0);

  // Potty training derived from dog.training.potty
  const pottyTraining = training?.potty || {};
  const pottyGoal = pottyTraining.goal || 0;
  const pottySuccess = pottyTraining.successCount || 0;
  const pottyTrainingComplete = Boolean(pottyTraining.completedAt);

  const pottyTrainingProgress = pottyTrainingComplete
    ? 100
    : pottyGoal
      ? Math.min(100, Math.round((pottySuccess / pottyGoal) * 100))
      : 0;

  const isPottyTrained = pottyTrainingComplete;

  // Cleanliness tier pill tone
  const cleanlinessTone =
    cleanlinessTier === "MANGE"
      ? "danger"
      : cleanlinessTier === "FLEAS"
        ? "warn"
        : "default";

  const cleanlinessLabel =
    cleanlinessTier === "MANGE"
      ? "Mange"
      : cleanlinessTier === "FLEAS"
        ? "Fleas"
        : cleanlinessTier === "DIRTY"
          ? "Dirty"
          : "Fresh";

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-zinc-400">
          Pup needs
        </p>

        <Pill
          label="Coat"
          value={cleanlinessLabel}
          tone={cleanlinessTone}
        />
      </div>

      <div className="space-y-3">
        <StatBar label="Hunger" value={hunger} color="bg-emerald-500" />
        <StatBar label="Happiness" value={happiness} color="bg-sky-500" />
        <StatBar label="Energy" value={energy} color="bg-violet-500" />
        <StatBar
          label="Cleanliness"
          value={cleanliness}
          color="bg-amber-400"
        />
        {/* Thirst, weight, etc. can be added later when added to dog.stats */}
      </div>

      <div className="mt-3 border-t border-zinc-800 pt-3 text-xs text-zinc-400 space-y-2">
        <div className="flex items-center justify-between">
          <p className="uppercase tracking-wide text-[0.65rem]">
            Potty training
          </p>
          <Pill
            label="Badge"
            value={isPottyTrained ? "Trained" : "In training"}
            tone={isPottyTrained ? "default" : "warn"}
          />
        </div>

        <div className="mt-1">
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500"
              style={{
                width: `${Math.max(
                  0,
                  Math.min(100, pottyTrainingProgress)
                )}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[0.7rem] text-zinc-500 mt-1">
            <span>Progress</span>
            <span>{Math.round(pottyTrainingProgress || 0)}%</span>
          </div>
        </div>

        {!pottyTrainingComplete && pottyGoal > 0 && (
          <p className="text-[0.65rem] text-zinc-400">
            {pottySuccess}/{pottyGoal} successful breaks logged.
          </p>
        )}

        {!pottyTrainingComplete && pottyGoal === 0 && (
          <p className="text-[0.65rem] text-zinc-500">
            Start potty training from the Potty page to unlock this badge.
          </p>
        )}
      </div>
    </div>
  );
}
