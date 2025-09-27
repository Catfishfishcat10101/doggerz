import React from "react";
import { useSelector } from "react-redux";
import { selectStats, selectMood, selectDog } from "@/redux/dogSlice";
import { selectWallet } from "@/redux/economySlice";

function Bar({ label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-sm text-white/70">{label}</span>
      <div className="h-2 w-48 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="w-10 text-xs text-white/60 text-right">{value}%</span>
    </div>
  );
}

export default function NeedsHUD() {
  const stats = useSelector(selectStats);
  const mood = useSelector(selectMood);
  const dog  = useSelector((s) => s.dog);
  const { coins, gems } = useSelector(selectWallet);

  return (
    <aside className="p-4 rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="text-white font-semibold">{dog.name} • Lv.{dog.level}</div>
        <div className="px-2 py-1 rounded-full text-xs bg-white/10 text-white">{mood}</div>
      </div>
      <div className="space-y-2">
        <Bar label="Hunger"  value={stats.hunger} />
        <Bar label="Energy"  value={stats.energy} />
        <Bar label="Fun"     value={stats.fun} />
        <Bar label="Hygiene" value={stats.hygiene} />
      </div>
      <div className="mt-4 flex items-center gap-3 text-white/80">
        <span className="px-2 py-1 rounded bg-yellow-500/20">🪙 {coins}</span>
        <span className="px-2 py-1 rounded bg-fuchsia-500/20">💎 {gems}</span>
      </div>
    </aside>
  );
}