// src/features/game/components/CareActionsPanel.jsx
// Compact panel for all core care actions.

import React from "react";
import PropTypes from "prop-types";

/**
 * CareActionsPanel - compact panel for all core care actions.
 * @param {object} props
 * @param {function} props.onCareAction
 * @param {number} [props.pottyLevel]
 * @param {number} [props.poopCount]
 * @param {boolean} [props.lowEnergy]
 */
export default function CareActionsPanel({
  onCareAction,
  pottyLevel,
  poopCount,
  lowEnergy,
}) {
  const handleClick = (action) => () => {
    if (typeof onCareAction === "function") {
      onCareAction(action);
    }
  };

  const safePotty = Number.isFinite(pottyLevel) ? pottyLevel : 0;
  const safePoop = Number.isFinite(poopCount) ? poopCount : 0;

  const pottyReady = safePotty >= 25;
  const poopWaiting = safePoop > 0;

  return (
    <section
      className="bg-zinc-900/80 border border-zinc-700/80 rounded-2xl p-3 lg:p-4 shadow-lg shadow-black/40 space-y-3"
      aria-label="Dog care actions"
    >
      <h2 className="text-sm font-semibold text-zinc-100">Care actions</h2>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <button
          type="button"
          aria-label="Feed your dog"
          onClick={handleClick("feed")}
          className="rounded-lg bg-amber-400 text-black font-semibold py-2 hover:bg-amber-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          🍖 Feed
        </button>

        <button
          type="button"
          aria-label="Play with your dog"
          onClick={handleClick("play")}
          className="rounded-lg bg-pink-400 text-black font-semibold py-2 hover:bg-pink-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          🎾 Play
        </button>

        <button
          type="button"
          aria-label="Bathe your dog"
          onClick={handleClick("bathe")}
          className="rounded-lg bg-emerald-400 text-black font-semibold py-2 hover:bg-emerald-300 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          🛁 Bathe
        </button>

        <button
          type="button"
          aria-label="Take your dog for a potty walk"
          onClick={handleClick("potty")}
          disabled={!pottyReady}
          className="rounded-lg bg-indigo-400 text-black font-semibold py-2 hover:bg-indigo-300 transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          🚶 Potty walk
        </button>

        <button
          type="button"
          aria-label="Scoop the yard"
          onClick={handleClick("scoop")}
          disabled={!poopWaiting}
          className="rounded-lg bg-lime-400 text-black font-semibold py-2 hover:bg-lime-300 transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          🗑️ Scoop yard
        <button
          type="button"
            aria-label="Train obedience"
          onClick={handleClick("train")}
          disabled={lowEnergy}
            className="rounded-lg bg-zinc-800 text-zinc-100 font-semibold py-2 hover:bg-zinc-700 transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
          >
            className="rounded-lg bg-orange-400 text-black font-semibold py-2 hover:bg-orange-300 transition disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900"
        >
          🐕 Train &quot;Sit&quot;
        </button>
      </div>

      <p className="text-[0.7rem] text-zinc-300">
        Actions update stats immediately and sync to your save. Potty walk
        unlocks around 25% on the gauge; training drains a bit of energy.
      </p>
    </section>
  );
}

CareActionsPanel.propTypes = {
  onCareAction: PropTypes.func.isRequired,
  pottyLevel: PropTypes.number,
  poopCount: PropTypes.number,
  lowEnergy: PropTypes.bool,
};
