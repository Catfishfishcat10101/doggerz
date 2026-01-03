// src/features/game/NeedsHUD.jsx
// @ts-nocheck

import { useSelector } from "react-redux";
import {
  selectDog,
  selectDogTraining,
} from "@/redux/dogSlice.js";

function StatBar({ label, value = 0, color = "bg-emerald-500" }) {
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

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px] text-zinc-300/80">
        <span className="uppercase tracking-[0.16em] text-zinc-400">{label}</span>
        <span className="font-semibold text-zinc-200">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-black/35 border border-white/10 overflow-hidden">
        <div
          className={`h-full ${color} ${glow}`}
          style={{
            width: `${pct}%`,
            backgroundImage:
              "linear-gradient(90deg, rgba(255,255,255,0.10), rgba(255,255,255,0.0))",
          }}
        />
      </div>
    </div>
  );
}

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

export default function NeedsHUD() {
  const dog = useSelector(selectDog);
  const training = useSelector(selectDogTraining);

  if (!dog) return null;

  const stats = dog.stats || {};
  // Internally hunger is "hunger level" (0 = full, 100 = starving). UI should read as fullness.
  const hungerLevel = Math.round(stats.hunger ?? 0);
  const food = Math.max(0, Math.min(100, 100 - hungerLevel));
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
      </div>

      <div className="space-y-3">
        <StatBar label="Food" value={food} color="bg-emerald-500" />
        <StatBar label="Happiness" value={happiness} color="bg-sky-500" />
        <StatBar label="Energy" value={energy} color="bg-violet-500" />
        <StatBar label="Cleanliness" value={cleanliness} color="bg-amber-400" />
        {/* Thirst, weight, etc. can be added later when added to dog.stats */}
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
            <div className="h-2 rounded-full bg-black/35 border border-white/10 overflow-hidden">
              <div
                className="h-full bg-emerald-500"
                style={{
                  width: `${Math.max(0, Math.min(100, pottyTrainingProgress))}%`,
                }}
              />
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
}
