// src/pages/TemperamentReveal.jsx
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectDogTemperament, selectDog } from "@/redux/dogSlice.js";
import { markTemperamentRevealed } from "@/redux/dogSlice.js";
import { PATHS } from "@/routes.js";

export default function TemperamentReveal() {
  const dispatch = useDispatch();
  const nav = useNavigate();
  const temperament = useSelector(selectDogTemperament);
  const dog = useSelector(selectDog);

  if (!temperament) return null;

  const daysSinceAdopt = (() => {
    if (!temperament.adoptedAt) return 0;
    const diff = Date.now() - temperament.adoptedAt;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  })();

  const handleReveal = () => {
    dispatch(markTemperamentRevealed());
    // After reveal, send player to the game
    nav(PATHS.GAME);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50 p-6">
      <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold">Temperament Report</h2>
        <p className="text-sm text-zinc-400">
          A quick look at {dog?.name || "your pup"}'s personality after {daysSinceAdopt} days of
          play.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-zinc-950/20 rounded">
            <div className="text-xs text-zinc-400">Primary</div>
            <div className="text-lg font-semibold">{temperament.primary}</div>
          </div>
          <div className="p-4 bg-zinc-950/20 rounded">
            <div className="text-xs text-zinc-400">Secondary</div>
            <div className="text-lg font-semibold">{temperament.secondary}</div>
          </div>
          <div className="p-4 bg-zinc-950/20 rounded">
            <div className="text-xs text-zinc-400">Reveal status</div>
            <div className="text-lg font-semibold">
              {temperament.revealedAt ? "Revealed" : temperament.revealReady ? "Ready" : "Pending"}
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {temperament.traits.map((t) => (
            <div key={t.id} className="flex items-center justify-between">
              <div className="text-sm text-zinc-300">{t.label}</div>
              <div className="text-sm font-semibold">{t.intensity}%</div>
            </div>
          ))}
        </div>

        <div className="pt-4 flex gap-3">
          <button
            onClick={handleReveal}
            disabled={!temperament.revealReady}
            className="rounded bg-emerald-500 px-4 py-2 font-semibold text-zinc-900 disabled:opacity-50"
          >
            Reveal Personality
          </button>

          <button
            onClick={() => nav(PATHS.GAME)}
            className="rounded border border-zinc-700 px-4 py-2 text-sm"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
