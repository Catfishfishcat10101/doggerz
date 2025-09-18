// src/components/Features/StatsPanel.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectDog, selectDogLevel, selectCoins } from "../../redux/dogSlice";

function Bar({ label, value = 0 }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="space-y-1">
      <div className="text-xs text-rose-900/70">{label}</div>
      <div className="h-3 bg-rose-100 rounded-full overflow-hidden">
        <div className="h-full bg-rose-600" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

export default function StatsPanel() {
  const dog = useSelector(selectDog) || {};
  const coins = useSelector(selectCoins);
  const level = useSelector(selectDogLevel);
  const needs = dog.needs || { hunger: 50, energy: 50, cleanliness: 50, happiness: 50 };

  const buff = sessionStorage.getItem("buff");

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-rose-900">Stats</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 rounded bg-rose-100 text-rose-900">Lv {level}</span>
          <span className="px-2 py-1 rounded bg-rose-100 text-rose-900">💰 {coins}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <Bar label="Happiness" value={needs.happiness} />
        <Bar label="Energy" value={needs.energy} />
        <Bar label="Cleanliness" value={needs.cleanliness} />
        <Bar label="Hunger (lower is better)" value={100 - (needs.hunger ?? 50)} />
      </div>

      <div className="mt-4 text-xs text-rose-900/70">
        {buff ? `Session Buff: ${buff}` : "No active session buffs."}
      </div>
    </div>
  );
}
