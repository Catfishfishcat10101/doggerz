// src/components/UI/MainGame.jsx
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

// Playfield UI
import DogSprite from "./DogSprite.jsx";
import DogName from "./DogName.jsx";
import ToyBox from "./ToyBox.jsx";
import TrickList from "./TrickList.jsx";
import PoopScoop from "./PoopScoop.jsx";
import ResetGame from "./ResetGame.jsx";

// Engines & background
import DogAIEngine from "./DogAIEngine.jsx";
import FirebaseAutoSave from "@/components/common/FirebaseAutoSave.jsx";
import BackgroundScene from "@/components/Features/BackgroundScene.jsx";
import NeedsHUD from "@/components/Features/NeedsHUD.jsx";

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

/* ------------------------------ Potty panel ------------------------------ */
// Adapter panel so we don’t pass props to the Redux-connected page component
function PottyTrainingPanel() {
  const level = useSelector((s) => s.dog?.pottyLevel ?? 0);
  const trained = useSelector((s) => s.dog?.isPottyTrained ?? false);
  const dispatch = useDispatch();
  const onTrain = () => dispatch(trainDog());
  return (
    <div className="rounded-xl bg-slate-900/40 p-4 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="font-semibold">Potty Training</div>
        <div className="text-sm opacity-80">{Math.round(level)}%</div>
      </div>
      <div className="meter mt-2">
        <div
          className="meter__fill transition-[width] duration-300"
          style={{
            width: `${Math.min(100, Math.max(0, level))}%`,
            backgroundColor: trained
              ? "rgb(34 197 94 / 0.9)"
              : "rgb(250 204 21 / 0.9)",
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

/* ------------------------------- Main game ------------------------------- */
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

  // Action creators for side-panel components (kept; HUD is non-interactive)
  const doFeed = useCallback(() => dispatch(feedDog()), [dispatch]);
  const doPlay = useCallback(() => dispatch(playDog()), [dispatch]);
  const doTrain = useCallback(() => dispatch(trainDog()), [dispatch]);
  const doRest = useCallback(() => dispatch(restDog()), [dispatch]);
  const doUseToy = useCallback(
    (toy) => dispatch(useToyAction({ toy })),
    [dispatch],
  );
  const doScoop = useCallback(() => dispatch(scoopPoopAction()), [dispatch]);
  const doLearnTrick = useCallback(
    (trick) => dispatch(learnTrickAction({ trick })),
    [dispatch],
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* NavBar is already rendered by RootLayout; do not mount it again here. */}

      {/* Background engine & autosave */}
      <DogAIEngine />
      <FirebaseAutoSave />

      <main className="mx-auto max-w-6xl p-4 md:p-6 grid gap-4 md:gap-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Playfield + HUD */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-800/60 shadow-xl p-4 md:p-6 border border-white/10">
            {/* Header row */}
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

            {/* Stage + HUD */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stage */}
              <BackgroundScene skin="default" className="rounded-xl">
                <div
                  className="relative h-[420px] md:h-[460px] rounded-xl border border-white/10 bg-slate-900/30 overflow-hidden"
                  aria-label="Playfield"
                >
                  {/* Helper */}
                  <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded bg-black/30 border border-white/10">
                    Move: WASD / Arrows • Rest: idle
                  </div>

                  {/* Dog sprite (uses your AI engine to update pos/mood) */}
                  <div className="absolute" style={{ left: pos.x, top: pos.y }}>
                    <DogSprite mood={mood} poopCount={poopCount} />
                  </div>
                </div>
              </BackgroundScene>

              {/* HUD: non-interactive, realistic, with ETAs and big brand */}
              <div className="rounded-xl bg-slate-900/40 p-4 border border-white/10">
                <NeedsHUD />
              </div>
            </div>

            {/* Sim affordances */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <PoopScoop poopCount={poopCount} onScoop={doScoop} />
              <PottyTrainingPanel />
            </div>
          </div>

          {/* Side panel */}
          <aside className="rounded-2xl bg-slate-800/60 shadow-xl p-4 md:p-6 space-y-4 border border-white/10">
            {showToys && (
              <ToyBox toys={toys} onUseToy={doUseToy} happiness={happiness} />
            )}
            {showTricks && (
              <TrickList
                learnedTricks={learnedTricks}
                onLearnTrick={doLearnTrick}
              />
            )}
            {/* Optional quick actions (kept off the HUD) */}
            <div className="grid grid-cols-2 gap-2">
              <button
                className="btn"
                onClick={doFeed}
                title="Feed to reduce hunger decay"
              >
                Feed
              </button>
              <button
                className="btn"
                onClick={doPlay}
                title="Play to raise fun"
              >
                Play
              </button>
              <button
                className="btn"
                onClick={doTrain}
                title="Train to improve skills"
              >
                Train
              </button>
              <button
                className="btn"
                onClick={doRest}
                title="Rest to restore energy"
              >
                Rest
              </button>
            </div>
            <ResetGame />
          </aside>
        </section>
      </main>
    </div>
  );
}
