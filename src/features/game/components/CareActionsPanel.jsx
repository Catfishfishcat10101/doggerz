import React from "react";

export default function CareActionsPanel({
  onCareAction,
  dogIsAsleep,
  pottyLevel,
  poopCount,
  lowEnergy,
}) {
  const handleClick = (action) => () => onCareAction(action);
  const pottyReady = (pottyLevel ?? 0) >= 25;
  const poopWaiting = (poopCount ?? 0) > 0;

  return (
    <div className="bg-zinc-900/80 border border-zinc-700/80 rounded-2xl p-3 lg:p-4 shadow-lg shadow-black/40 space-y-3">
      <p className="text-sm font-semibold text-zinc-100">Care actions</p>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <button type="button" onClick={handleClick("feed")} className="rounded-lg bg-amber-400/90 text-black font-semibold py-2 hover:bg-amber-300 transition">
          Feed snack
        </button>
        <button type="button" onClick={handleClick("play")} className="rounded-lg bg-pink-400/90 text-black font-semibold py-2 hover:bg-pink-300 transition">
          Play fetch
        </button>
        <button type="button" onClick={handleClick("rest")} className="rounded-lg bg-sky-400/90 text-black font-semibold py-2 hover:bg-sky-300 transition">
          {dogIsAsleep ? "Wake up" : "Nap time"}
        </button>
        <button type="button" onClick={handleClick("bathe")} className="rounded-lg bg-emerald-400/90 text-black font-semibold py-2 hover:bg-emerald-300 transition">
          Bath day
        </button>
        <button
          type="button"
          onClick={handleClick("potty")}
          disabled={!pottyReady}
          className="rounded-lg bg-indigo-400/90 text-black font-semibold py-2 hover:bg-indigo-300 transition disabled:opacity-40"
        >
          Go potty
        </button>
        <button
          type="button"
          onClick={handleClick("scoop")}
          disabled={!poopWaiting}
          className="rounded-lg bg-lime-400/90 text-black font-semibold py-2 hover:bg-lime-300 transition disabled:opacity-40"
        >
          Scoop yard
        </button>
        <button
          type="button"
          onClick={handleClick("train")}
          disabled={lowEnergy}
          className="rounded-lg bg-orange-400/90 text-black font-semibold py-2 hover:bg-orange-300 transition disabled:opacity-40"
        >
          Train "Sit"
        </button>
      </div>
      <p className="text-[0.7rem] text-zinc-400">
        Actions update stats immediately and sync to your save. Potty is ready once the gauge hits 25+. Training uses a bit of energy.
      </p>
    </div>
  );
}
