// src/features/game/GameScene.jsx
import React from "react";
import { useDispatch } from "react-redux";

import BackgroundScene from "./BackgroundScene.jsx";
import DogSpriteView from "./DogSpriteView.jsx";
import NeedsHUD from "./NeedsHUD.jsx";
import DogAIEngine from "./DogAIEngine.jsx";

import {
  feed as feedDog,
  play as playDog,
  rest as restDog,
  scoopPoop as scoopPoopAction,
} from "@/redux/dogSlice.js";

function ActionButton({ label, onClick, variant = "primary" }) {
  const base =
    "inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors transition-transform duration-150 active:scale-[0.97]";

  const styles =
    variant === "primary"
      ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30"
      : variant === "outline"
      ? "border border-slate-600/70 text-slate-100 hover:bg-slate-800/80"
      : "bg-slate-800 text-slate-100 hover:bg-slate-700";

  return (
    <button
      type="button"
      className={`${base} ${styles}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function GameScene() {
  const dispatch = useDispatch();

  return (
    <BackgroundScene>
      {/* headless game loop */}
      <DogAIEngine />

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)] items-center">
        {/* Dog + actions */}
        <div className="space-y-6">
          <DogSpriteView />

          <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-xl shadow-slate-950/60 p-4 sm:p-5 space-y-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Actions
            </p>
            <div className="flex flex-wrap gap-2">
              <ActionButton
                label="Feed"
                onClick={() => dispatch(feedDog())}
                variant="primary"
              />
              <ActionButton
                label="Play"
                onClick={() => dispatch(playDog())}
                variant="outline"
              />
              <ActionButton
                label="Rest"
                onClick={() => dispatch(restDog())}
              />
              <ActionButton
                label="Scoop Poop"
                onClick={() => dispatch(scoopPoopAction())}
              />
            </div>
          </div>
        </div>

        {/* HUD */}
        <div>
          <NeedsHUD />
        </div>
      </div>
    </BackgroundScene>
  );
}
