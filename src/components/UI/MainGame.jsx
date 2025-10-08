// src/components/UI/MainGame.jsx
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Playfield UI
import DogSprite from "./DogSprite.jsx";
import StatsPanel from "./StatsPanel.jsx";
import Status from "./Status.jsx";
import Controls from "./Controls.jsx";
import DogName from "./DogName.jsx";
import ToyBox from "./ToyBox.jsx";
import TrickList from "./TrickList.jsx";
import PoopScoop from "./PoopScoop.jsx";
import ResetGame from "./ResetGame.jsx";

// Engines & background
import DogAIEngine from "./DogAIEngine.jsx";
import FirebaseAutoSave from "@/components/common/FirebaseAutoSave.jsx";
import BackgroundScene from "@/components/Features/BackgroundScene.jsx";

// If your slice exposes creators, prefer importing them over string types.
import {
  feed as feedDog,
  play as playDog,
  train as trainDog,
  rest as restDog,
  useToy as useToyAction,
  scoopPoop as scoopPoopAction,
  learnTrick as learnTrickAction,
  selectDog,
} from "@/redux/dogSlice.js";

// Adapter panel so we don’t pass props to the Redux-connected page component
function PottyTrainingPanel() {
  // If you want the *page* experience, render a Link to `/potty` instead.
  // Here we inline a tiny progress affordance to keep the panel.
  const level = useSelector((s) => s.dog?.pottyLevel ?? 0);
  const trained = useSelector((s) => s.dog?.isPottyTrained ?? false);
  const dispatch = useDispatch();
  const onTrain = () => dispatch(trainDog());
  return (
    <div className="rounded-xl bg-slate-900/40 p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Potty Training</div>
        <div className="text-sm opacity-80">{Math.round(level)}%</div>
      </div>
      <div className="meter mt-2">
        <div
          className="meter__fill transition-[width] duration-300"
          style={{
            width: `${Math.min(100, Math.max(0, level))}%`,
            backgroundColor: trained ? "rgb(34 197 94 / 0.9)" : "rgb(250 204 21 / 0.9)",
          }}
        />
      </div>
      <button
        onClick={onTrain}
        disabled={trained}
        className={`mt-3 btn ${trained ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        {trained ? "Fully Trained 🎉" : "Train Potty"}
      </button>
    </div>
  );
}

export default function MainGame() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog) ?? {};
  const {
    name = "Pupper",
    happiness = 100,
    energy = 100,
    hunger = 100,
    cleanliness = 100,
    mood = "idle",
    poopCount = 0,
    isPottyTrained = false,
    toys = ["Ball", "Rope", "Bone"],
    learnedTricks = [],
    pos = { x: 24, y: 24 },
  } = dog;

  // simple UI panel toggles
  const [showToys, setShowToys] = useState(false);
  const [showTricks, setShowTricks] = useState(false);

  // Prefer action creators (imported) over string action types
  const doFeed = useCallback(() => dispatch(feedDog()), [dispatch]);
  const doPlay = useCallback(() => dispatch(playDog()), [dispatch]);
  const doTrain = useCallback(() => dispatch(trainDog()), [dispatch]);
  const doRest = useCallback(() => dispatch(restDog()), [dispatch]);
  const doUseToy = useCallback((toy) => dispatch(useToyAction({ toy })), [dispatch]);
  const doScoop = useCallback(() => dispatch(scoopPoopAction()), [dispatch]);
  const doLearnTrick = useCallback((trick) => dispatch(learnTrickAction({ trick })), [dispatch]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* NavBar is already rendered by RootLayout; do not mount it again here. */}

      {/* Background engine & autosave */}
      <DogAIEngine />
      <FirebaseAutoSave />

      <main className="mx-auto max-w-6xl p-4 md:p-6 grid gap-4 md:gap-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Playfield + HUD */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-800/60 shadow-xl p-4 md:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <DogName defaultName={name} />
              <div className="flex gap-2">
                <button
                  className="rounded-xl border border-slate-600 px-3 py-1 text-xs md:text-sm hover:bg-slate-700"
                  onClick={() => {
                    setShowToys((v) => !v);
                    setShowTricks(false);
                  }}
                >
                  {showToys ? "Hide Toys" : "Show Toys"}
                </button>
                <button
                  className="rounded-xl border border-slate-600 px-3 py-1 text-xs md:text-sm hover:bg-slate-700"
                  onClick={() => {
                    setShowTricks((v) => !v);
                    setShowToys(false);
                  }}
                >
                  {showTricks ? "Hide Tricks" : "Show Tricks"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stage */}
              <BackgroundScene skin="default" className="rounded-xl">
                <div
                  className="relative h-[420px] md:h-[460px] rounded-xl border border-white/10 bg-slate-900/30 overflow-hidden"
                  aria-label="Playfield"
                >
                  {/* Non-color cue/help */}
                  <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded bg-black/30 border border-white/10">
                    WASD / Arrow keys to move
                  </div>

                  {/* Yard zone */}
                  <div className="yard-zone">
                    <span className="yard-zone__label">Yard</span>
                  </div>

                  {/* Dog sprite */}
                  <div className="absolute" style={{ left: pos.x, top: pos.y }}>
                    <DogSprite mood={mood} poopCount={poopCount} />
                  </div>
                </div>
              </BackgroundScene>

              {/* HUD */}
              <div className="rounded-xl bg-slate-900/40 p-4">
                <StatsBar
                  hunger={hunger}
                  energy={energy}
                  happiness={happiness}
                  cleanliness={cleanliness}
                />
                <div className="mt-4">
                  <Status
                    hunger={hunger}
                    energy={energy}
                    happiness={happiness}
                    cleanliness={cleanliness}
                    isPottyTrained={isPottyTrained}
                    poopCount={poopCount}
                  />
                </div>
                <div className="mt-4">
                  <Controls onFeed={doFeed} onPlay={doPlay} onTrain={doTrain} onRest={doRest} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <PoopScoop poopCount={poopCount} onScoop={doScoop} />
              <PottyTrainingPanel />
            </div>
          </div>

          {/* Side panel */}
          <aside className="rounded-2xl bg-slate-800/60 shadow-xl p-4 md:p-6 space-y-4">
            {showToys && <ToyBox toys={toys} onUseToy={doUseToy} happiness={happiness} />}
            {showTricks && <TrickList learnedTricks={learnedTricks} onLearnTrick={doLearnTrick} />}
            <ResetGame />
          </aside>
        </section>
      </main>
    </div>
  );
}
