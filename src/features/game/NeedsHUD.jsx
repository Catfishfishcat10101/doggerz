import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

function StatBar({ label, value, accent = "bg-emerald-500" }) {
  const pct = Math.max(0, Math.min(100, Number(value ?? 0)));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[0.65rem] sm:text-xs text-slate-400">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
        <div
          className={`h-full ${accent} transition-[width] duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function NeedsHUD() {
  const dog = useSelector(selectDog);
  const stats = dog?.stats || {};

  return (
    <section className="rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-xl shadow-slate-950/60 p-4 sm:p-5 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Pup Status
        </p>
        <p className="text-xs text-slate-400">
          Lv. {dog?.level ?? 1} · {dog?.coins ?? 0} coins
        </p>
      </div>

      <div className="space-y-3">
        <StatBar label="Hunger" value={stats.hunger} accent="bg-amber-400" />
        <StatBar label="Happiness" value={stats.happiness} accent="bg-pink-500" />
        <StatBar label="Energy" value={stats.energy} accent="bg-sky-400" />
        <StatBar label="Cleanliness" value={stats.cleanliness} accent="bg-emerald-400" />
      </div>
    </section>
  );
}
