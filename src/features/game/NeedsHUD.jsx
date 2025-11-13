import React from "react";
import { useSelector } from "react-redux";
import DogSprite from "@/components/UI/DogSprite.jsx";
import { selectDog } from "@/redux/dogSlice.js";

export default function NeedsHUD() {
  const dog = useSelector(selectDog) || {};

  const name = dog.name || "Pup";
  const coins = dog.coins ?? 0;

  const stats = dog.stats || {
    hunger: 0,
    happiness: 0,
    energy: 0,
    cleanliness: 0,
  };

  const clamp = (v) => Math.min(100, Math.max(0, Number(v) || 0));

  return (
    <div className="w-full rounded-2xl bg-slate-900/80 border border-white/10 px-4 py-3 shadow-xl backdrop-blur-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <DogSprite
            direction="down"
            speed={260}
            scale={1.4}
            className="rounded-md shadow-md"
            aria-label="Dog avatar"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-[0.65rem] uppercase tracking-wide text-slate-400">
              Dogger
            </span>
            <span className="text-sm font-semibold text-slate-100">
              {name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-amber-300 font-semibold">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" />
          </svg>
          <span>{coins}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatBar label="Hunger" value={clamp(stats.hunger)} color="emerald" />
        <StatBar label="Happiness" value={clamp(stats.happiness)} color="cyan" />
        <StatBar label="Energy" value={clamp(stats.energy)} color="violet" />
        <StatBar
          label="Cleanliness"
          value={clamp(stats.cleanliness)}
          color="amber"
        />
      </div>
    </div>
  );
}

function StatBar({ label, value, color }) {
  const colors = {
    emerald: "bg-emerald-500",
    cyan: "bg-cyan-500",
    violet: "bg-violet-500",
    amber: "bg-amber-400",
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-[0.65rem] text-slate-400">
        <span>{label}</span>
        <span>{value}%</span>
      </div>

      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${colors[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
