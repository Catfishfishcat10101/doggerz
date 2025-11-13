import React from "react";
import { useDispatch, useSelector } from "react-redux";
import DogSprite from "./DogSprite.jsx";
import {
  feed,
  play,
  rest,
  bathe,
  scoopPoop,
  selectDog,
} from "@/redux/dogSlice.js";

export default function MainGame() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-50 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {dog.name || "Pup"}
            </h1>
            <p className="text-xs text-zinc-400">
              Lv.{dog.level} • {dog.coins} coins
            </p>
          </div>
        </header>

        {/* Playfield */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Dog area */}
          <div className="flex-1 flex items-center justify-center">
            <DogSprite direction="down" />
          </div>

          {/* Stats & actions */}
          <div className="flex-1 space-y-4">
            {/* Stats */}
            <div className="space-y-2">
              <StatBar label="Hunger" value={dog.stats.hunger} />
              <StatBar label="Happiness" value={dog.stats.happiness} />
              <StatBar label="Energy" value={dog.stats.energy} />
              <StatBar label="Cleanliness" value={dog.stats.cleanliness} />
            </div>

            {/* Actions */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                className="btn-primary"
                onClick={() => dispatch(feed())}
              >
                Feed
              </button>
              <button
                className="btn-primary"
                onClick={() => dispatch(play())}
              >
                Play
              </button>
              <button
                className="btn-primary"
                onClick={() => dispatch(rest())}
              >
                Rest
              </button>
              <button
                className="btn-primary"
                onClick={() => dispatch(bathe())}
              >
                Bathe
              </button>
              <button
                className="btn-secondary col-span-2"
                onClick={() => dispatch(scoopPoop())}
              >
                Scoop Poop ({dog.poopCount})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value }) {
  const pct = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-sky-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
