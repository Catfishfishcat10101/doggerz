// src/components/UI/MainGame.jsx
import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import NavBar from "./NavBar.jsx";
import DogSprite from "./DogSprite.jsx";
import StatsBar from "./StatsBar.jsx";
import Status from "./Status.jsx";
import Controls from "./Controls.jsx";
import DogName from "./DogName.jsx";
import ToyBox from "./ToyBox.jsx";
import TrickList from "./TrickList.jsx";
import PottyTraining from "./PottyTraining.jsx";
import PoopScoop from "./PoopScoop.jsx";
import ResetGame from "./ResetGame.jsx";
import DogAIEngine from "./DogAIEngine.jsx";
import FirebaseAutoSave from "@/components/common/FirebaseAutoSave.jsx";

export default function MainGame() {
  const dispatch = useDispatch();
  const dog = useSelector((s) => s.dog ?? {});
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
  } = dog;

  // simple UI panel toggles
  const [showToys, setShowToys] = useState(false);
  const [showTricks, setShowTricks] = useState(false);

  // Action helpers (generic action types; wire these in your slice)
  const doFeed = useCallback(() => dispatch({ type: "dog/feed" }), [dispatch]);
  const doPlay = useCallback(() => dispatch({ type: "dog/play" }), [dispatch]);
  const doTrain = useCallback(() => dispatch({ type: "dog/train" }), [dispatch]);
  const doRest = useCallback(() => dispatch({ type: "dog/rest" }), [dispatch]);
  const doUseToy = useCallback(
    (toy) => dispatch({ type: "dog/useToy", payload: { toy } }),
    [dispatch]
  );
  const doScoop = useCallback(
    () => dispatch({ type: "dog/scoopPoop" }),
    [dispatch]
  );
  const doPottyTrain = useCallback(
    () => dispatch({ type: "dog/pottyTrain" }),
    [dispatch]
  );
  const doLearnTrick = useCallback(
    (trick) => dispatch({ type: "dog/learnTrick", payload: { trick } }),
    [dispatch]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      <NavBar />
      {/* Background engine & autosave */}
      <DogAIEngine />
      <FirebaseAutoSave />
      <main className="mx-auto max-w-6xl p-4 md:p-6 grid gap-4 md:gap-6">
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-slate-800/60 shadow-xl p-4 md:p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <DogName />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-900/40 p-4 flex items-center justify-center">
                <DogSprite mood={mood} poopCount={poopCount} />
              </div>

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
                  <Controls
                    onFeed={doFeed}
                    onPlay={doPlay}
                    onTrain={doTrain}
                    onRest={doRest}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <PoopScoop poopCount={poopCount} onScoop={doScoop} />
              <PottyTraining
                isPottyTrained={isPottyTrained}
                onTrain={doPottyTrain}
              />
            </div>
          </div>

          <aside className="rounded-2xl bg-slate-800/60 shadow-xl p-4 md:p-6 space-y-4">
            {showToys && (
              <ToyBox toys={toys} onUseToy={doUseToy} happiness={happiness} />
            )}
            {showTricks && (
              <TrickList
                learnedTricks={learnedTricks}
                onLearnTrick={doLearnTrick}
              />
            )}
            <ResetGame />
          </aside>
        </section>
      </main>
    </div>
  );
}