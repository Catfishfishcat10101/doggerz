// src/features/game/NeedsHUD.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  feedDog,
  playWithDog,
  batheDog,
  increasePottyLevel,
} from "@/redux/dogSlice";

function Bar({ label, value, color = "bg-emerald-500" }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-white/70 mb-1">
        <span>{label}</span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      <div className="h-2 rounded bg-white/10 overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function NeedsHUD() {
  const dog = useSelector((s) => s.dog);
  const dispatch = useDispatch();

  return (
    <div className="bg-white/5 rounded-xl p-4">
      <h3 className="font-semibold mb-3">Dog Needs</h3>
      <Bar label="Hunger" value={dog.hunger} color="bg-amber-400" />
      <Bar label="Happiness" value={dog.happiness} color="bg-pink-500" />
      <Bar label="Energy" value={dog.energy} color="bg-sky-500" />
      <Bar
        label={`Potty Training ${dog.isPottyTrained ? "(Trained!)" : ""}`}
        value={dog.pottyLevel}
        color="bg-lime-400"
      />

      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          className="px-3 py-2 rounded bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          onClick={() => dispatch(feedDog())}
        >
          🍖 Feed
        </button>
        <button
          className="px-3 py-2 rounded bg-sky-500 hover:bg-sky-600 text-black font-semibold"
          onClick={() => dispatch(playWithDog())}
        >
          🦴 Play
        </button>
        <button
          className="px-3 py-2 rounded bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
          onClick={() => dispatch(batheDog())}
        >
          🛁 Bathe
        </button>
        <button
          className="px-3 py-2 rounded bg-lime-400 hover:bg-lime-500 text-black font-semibold"
          onClick={() => dispatch(increasePottyLevel(10))}
        >
          🚽 Potty Train
        </button>
      </div>
    </div>
  );
}
