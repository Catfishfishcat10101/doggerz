// src/pages/Game.jsx
import React from "react";
import NeedsHUD from "@/components/Features/NeedsHUD.jsx";
import GameScene from "@/components/Features/GameScene.jsx";

export default function GamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-950 to-black text-slate-50 flex flex-col">
      {/* HUD / top bar */}
      <header className="w-full max-w-3xl mx-auto px-4 pt-4 pb-2 z-20">
        <NeedsHUD />
      </header>

      {/* Centered playfield */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
        <GameScene />
      </main>

      {/* Action bar */}
      <footer className="w-full max-w-3xl mx-auto px-4 pb-5">
        <ActionBar />
      </footer>
    </div>
  );
}

/* ------------------- ACTION BAR & BUTTONS ------------------- */

function ActionBar() {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <ActionButton label="Feed" color="emerald" dataAction="feed" />
      <ActionButton label="Play" color="cyan" dataAction="play" />
      <ActionButton label="Rest" color="violet" dataAction="rest" />
      <ActionButton label="Clean" color="amber" dataAction="clean" />
    </div>
  );
}

function ActionButton({ label, color, dataAction }) {
  const colors = {
    emerald: "bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600",
    cyan: "bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600",
    violet: "bg-violet-500 hover:bg-violet-400 active:bg-violet-600",
    amber: "bg-amber-500 hover:bg-amber-400 active:bg-amber-600",
  };

  return (
    <button
      type="button"
      data-action={dataAction}
      className={`
        px-5 py-2 rounded-full font-semibold text-sm text-black
        shadow-md shadow-black/40
        transition-transform transition-colors
        hover:-translate-y-0.5 active:translate-y-0
        ${colors[color] || colors.emerald}
      `}
    >
      {label}
    </button>
  );
}
