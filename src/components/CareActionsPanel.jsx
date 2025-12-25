// src/components/CareActionsPanel.jsx
// @ts-nocheck

import React from "react";

export default function CareActionsPanel({
  disabled = false,
  onFeed,
  onPlay,
  onBathe,
  onPotty,
}) {
  const baseBtn =
    "inline-flex items-center justify-center px-3 py-2 rounded-xl text-xs font-semibold transition border";
  const enabledSolid = "bg-emerald-500 text-black border-emerald-500";
  const enabledGhost =
    "bg-zinc-900 text-zinc-100 border-zinc-700 hover:border-emerald-400 hover:text-emerald-300";
  const disabledStyle = "bg-zinc-900 text-zinc-500 border-zinc-800";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
      {/* Feed */}
      <button
        type="button"
        disabled={disabled}
        onClick={onFeed}
        className={`${baseBtn} ${disabled ? disabledStyle : enabledSolid}`}
      >
        Feed
      </button>

      {/* Play */}
      <button
        type="button"
        disabled={disabled}
        onClick={onPlay}
        className={`${baseBtn} ${disabled ? disabledStyle : enabledGhost}`}
      >
        Play
      </button>

      {/* Bathe / Groom */}
      <button
        type="button"
        disabled={disabled}
        onClick={onBathe}
        className={`${baseBtn} ${disabled ? disabledStyle : enabledGhost}`}
      >
        Bathe
      </button>

      {/* Potty */}
      <button
        type="button"
        disabled={disabled}
        onClick={onPotty}
        className={`${baseBtn} ${disabled ? disabledStyle : enabledGhost}`}
      >
        Potty
      </button>
    </div>
  );
}
