// src/features/game/NeedsHUD.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

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
      <span className="uppercase tracking-wide text-[0.65rem] text-zinc-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

export default function NeedsHUD() {
  const dog = useSelector(selectDog);

  if (!dog) return null;

  const {
    stats = {},
    pottyTrainingProgress = 0,
    isPottyTrained = false,
  } = dog;

  const { hunger = 0, happiness = 0, energy = 0, cleanliness = 0, thirst = 0 } = stats;

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-5">
      <p className="text-xs uppercase tracking-wide text-zinc-400 mb-3">Pup needs</p>
      <div className="space-y-3">
        <StatBar label="Hunger" value={hunger} color="bg-emerald-500" />
        <StatBar label="Happiness" value={happiness} color="bg-sky-500" />
        <StatBar label="Energy" value={energy} color="bg-violet-500" />
        <StatBar label="Cleanliness" value={cleanliness} color="bg-amber-400" />
        <StatBar label="Thirst" value={thirst} color="bg-cyan-400" />
      </div>

      <div className="mt-4 border-t border-zinc-800 pt-3 text-xs text-zinc-400 space-y-2">
        <div className="flex items-center justify-between">
          <p className="uppercase tracking-wide text-[0.65rem]">Potty training</p>
          <Pill label="Badge" value={isPottyTrained ? "Trained" : "In training"} tone={isPottyTrained ? "default" : "warn"} />
        </div>

        <div className="mt-1">
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, pottyTrainingProgress))}%` }} />
          </div>
          <div className="flex justify-between text-[0.7rem] text-zinc-500 mt-1">
            <span>Progress</span>
            <span>{Math.round(pottyTrainingProgress || 0)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
