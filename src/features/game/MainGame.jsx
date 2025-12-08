// src/features/game/MainGame.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/hooks.js";

import BackyardBackground from "@/features/game/components/BackyardBackground.jsx";
import Dog3DSprite from "@/components/Dog3DSprite.jsx";
import TrainingPanel from "@/features/game/TrainingPanel.jsx";

import announce from "@/utils/announcer.js";
import {
  selectDogTraining,
  markTrainingUnlockNotified,
} from "@/redux/dogSlice.js";

import {
  feed as feedDog,
  play as playWithDog,
  bathe as cleanDog,
} from "@/redux/dogSlice.js";

export default function MainGame() {
  const dispatch = useAppDispatch();

  // Be defensive about shape so it does not crash if state changes
  const dogState = useSelector((state) => /** @type {any} */ (state).dog || {});
  const training = useSelector(selectDogTraining) || {};
  const {
    name = "Your Pup",
    lifeStage = "puppy",
    displayAge = "3 mo",
    hunger = 0.7,
    happiness = 0.8,
    energy = 0.5,
  } = dogState;

  const [view, setView] = useState("main"); // 'main' or 'training'

  // One-time unlock toast: announce when non-potty training becomes available
  useEffect(() => {
    const unlockedAt = training.nonPottyUnlockedAt;
    const notified = training.nonPottyUnlockNotified;
    if (!unlockedAt || notified) return;
    const now = Date.now();
    const unlockMs = new Date(unlockedAt).getTime();
    if (now >= unlockMs) {
      try {
        announce({
          message: "Advanced training unlocked! Check the Training tab.",
          type: "success",
        });
      } catch (e) {}
      dispatch(markTrainingUnlockNotified());
    }
  }, [training.nonPottyUnlockedAt, training.nonPottyUnlockNotified, dispatch]);

  const handleFeed = () => dispatch(feedDog());
  const handlePlay = () => dispatch(playWithDog());
  const handleClean = () => dispatch(cleanDog());

  return (
    <main className="min-h-screen bg-zinc-950 text-emerald-50 flex items-center justify-center">
      <div className="relative w-full max-w-md aspect-[9/16] rounded-[34px] overflow-hidden border border-emerald-500/40 shadow-[0_24px_80px_rgba(0,0,0,0.85)] bg-zinc-950">
        <BackyardBackground />

        <div className="absolute inset-0 flex flex-col">
          <TopHud
            name={name}
            displayAge={displayAge}
            hunger={hunger}
            happiness={happiness}
            energy={energy}
          />

          {/* Simple view tabs */}
          <div className="px-4 pt-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setView("main")}
                className={`text-sm px-3 py-1 rounded-full ${view === "main" ? "bg-emerald-700/10 border border-emerald-500/40" : "bg-transparent text-emerald-300/80"}`}
              >
                Play
              </button>
              <button
                onClick={() => setView("training")}
                className={`text-sm px-3 py-1 rounded-full flex items-center gap-2 ${view === "training" ? "bg-emerald-700/10 border border-emerald-500/40" : "bg-transparent text-emerald-300/80"}`}
              >
                Training
                {training.nonPottyUnlockedAt &&
                  !training.nonPottyUnlockNotified && (
                    <span className="ml-1 text-[10px] px-1 py-0.5 bg-emerald-400 text-zinc-900 rounded-full animate-pulse">
                      NEW
                    </span>
                  )}
              </button>
            </div>
          </div>

          <div className="flex-1 flex items-end justify-center pb-20">
            {view === "main" ? (
              <Dog3DSprite
                stage={lifeStage}
                size="lg"
                className="animate-doggerz-bob"
              />
            ) : (
              <div className="w-full">
                <TrainingPanel />
              </div>
            )}
          </div>

          {view === "main" && (
            <BottomActions
              onFeed={handleFeed}
              onPlay={handlePlay}
              onClean={handleClean}
            />
          )}
        </div>
      </div>
    </main>
  );
}

function TopHud({ name, displayAge, hunger, happiness, energy }) {
  const clamp01 = (n) => Math.max(0, Math.min(1, n ?? 0));

  const hungerPct = clamp01(hunger) * 100;
  const happinessPct = clamp01(happiness) * 100;
  const energyPct = clamp01(energy) * 100;

  return (
    <header className="px-4 pt-4 pb-2">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-300/80">
            Doggerz
          </p>
          <p className="text-lg font-semibold text-emerald-100 leading-tight">
            {name}
          </p>
        </div>

        <div className="px-3 py-1 rounded-full bg-zinc-950/70 border border-emerald-500/50 text-[11px] font-medium text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.65)]">
          Age&nbsp;{displayAge}
        </div>
      </div>

      <div className="space-y-1.5">
        <StatusBar
          label="Hunger"
          icon="🐾"
          valuePct={hungerPct}
          trackClass="bg-zinc-900/80"
          fillClass="bg-emerald-400"
        />
        <StatusBar
          label="Happiness"
          icon="♥"
          valuePct={happinessPct}
          trackClass="bg-zinc-900/80"
          fillClass="bg-sky-400"
        />
        <StatusBar
          label="Energy"
          icon="💤"
          valuePct={energyPct}
          trackClass="bg-zinc-900/80"
          fillClass="bg-amber-400"
        />
      </div>
    </header>
  );
}

function StatusBar({ label, icon, valuePct, trackClass, fillClass }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-emerald-200/90 w-14 flex items-center gap-1">
        <span className="text-[11px]">{icon}</span>
        {label}
      </span>
      <div
        className={`flex-1 h-2.5 rounded-full overflow-hidden ${trackClass}`}
      >
        <div
          className={`h-full ${fillClass}`}
          style={{ width: `${valuePct}%` }}
        />
      </div>
    </div>
  );
}

function BottomActions({ onFeed, onPlay, onClean }) {
  return (
    <nav className="px-4 pb-6">
      <div className="mx-auto w-full max-w-xs rounded-[24px] bg-zinc-950/80 border border-emerald-500/40 shadow-[0_0_32px_rgba(16,185,129,0.30)] backdrop-blur-md">
        <div className="flex items-center justify-around px-3 py-3">
          <CircleButton label="Feed" onClick={onFeed}>
            🍗
          </CircleButton>
          <CircleButton label="Play" onClick={onPlay}>
            🎾
          </CircleButton>
          <CircleButton label="Clean" onClick={onClean}>
            🧴
          </CircleButton>
        </div>
      </div>
    </nav>
  );
}

function CircleButton({ children, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center gap-1 focus:outline-none"
    >
      <div className="w-14 h-14 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.75)] flex items-center justify-center text-xl text-zinc-950 active:scale-95 transition-transform ring-1 ring-emerald-300/20">
        {children}
      </div>
      <span className="text-[11px] font-medium text-emerald-100">{label}</span>
    </button>
  );
}
