// src/features/game/MainGame.jsx
// @ts-nocheck

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDog,
  selectDogLifeStage,
  selectDogPolls,
  selectDogTraining,
  feed,
  play,
  bathe,
  goPotty,
  scoopPoop,
  trainObedience,
  respondToDogPoll,
  setAdoptedAt,
  setDogName,
} from "@/redux/dogSlice.js";

import EnhancedDogSprite from "@/components/EnhancedDogSprite.jsx";
import VoiceCommandButton from "@/components/VoiceCommandButton.jsx";
import CareActionsPanel from "@/components/CareActionsPanel.jsx";
import PottyTrackerCard from "@/components/PottyTrackerCard.jsx";
import GameTopBar from "@/components/GameTopBar.jsx";
import NeedsDashboard from "@/components/NeedsDashboard.jsx";

function computeTimeOfDayLabel() {
  const hours = new Date().getHours();
  if (hours < 5) return "night";
  if (hours < 9) return "dawn";
  if (hours < 17) return "day";
  if (hours < 21) return "dusk";
  return "night";
}

export default function MainGame() {
  const dispatch = useDispatch();

  const dog = useSelector(selectDog);
  const lifeStage = useSelector(selectDogLifeStage);
  const polls = useSelector(selectDogPolls);
  const training = useSelector(selectDogTraining);

  const [timeOfDay, setTimeOfDay] = useState(computeTimeOfDayLabel());
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(dog?.name || "");

  // Keep draft name in sync if dog is renamed elsewhere
  useEffect(() => {
    setDraftName(dog?.name || "");
  }, [dog?.name]);

  // Make sure adoptedAt exists for age logic
  useEffect(() => {
    if (!dog || dog.adoptedAtMs) return;
    dispatch(setAdoptedAt());
  }, [dispatch, dog, dog?.adoptedAtMs]);

  // Simple local clock-based time-of-day
  useEffect(() => {
    const id = setInterval(() => {
      setTimeOfDay(computeTimeOfDayLabel());
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  const stats = dog?.stats || {};
  const hunger = stats.hunger ?? 100;
  const happiness = stats.happiness ?? 100;
  const energy = stats.energy ?? 100;
  const cleanliness = stats.cleanliness ?? 100;
  const level = stats.level ?? 1;
  const coins = stats.coins ?? 0;

  const lifeStageLabel = lifeStage?.label ?? "Puppy";
  const lifeStageDay =
    lifeStage?.ageInGameDays ??
    lifeStage?.gameDay ??
    lifeStage?.day ??
    1;

  const needs = useMemo(
    () => ({
      hunger,
      happiness,
      energy,
      cleanliness,
    }),
    [hunger, happiness, energy, cleanliness]
  );

  const moodLabel =
    dog?.moodLabel || dog?.mood?.label || dog?.mood || "Content";

  const temperamentRevealReady = !!(
    training?.temperament?.ready ||
    training?.temperament?.revealReady
  );

  const handleFeed = useCallback(() => {
    dispatch(feed());
  }, [dispatch]);

  const handlePlay = useCallback(() => {
    dispatch(play());
  }, [dispatch]);

  const handleBathe = useCallback(() => {
    dispatch(bathe());
  }, [dispatch]);

  const handleGoPotty = useCallback(() => {
    dispatch(goPotty());
  }, [dispatch]);

  const handleScoopPoop = useCallback(() => {
    dispatch(scoopPoop());
  }, [dispatch]);

  const handleTrain = useCallback(() => {
    dispatch(trainObedience());
  }, [dispatch]);

  const handlePollResponse = useCallback(
    (pollId, accepted) => {
      dispatch(
        respondToDogPoll({
          pollId,
          accepted,
          respondedAt: Date.now(),
        })
      );
    },
    [dispatch]
  );

  const activePoll = polls?.active || polls?.current || null;

  const handleNameSave = useCallback(
    (e) => {
      e?.preventDefault?.();
      const trimmed = (draftName || "").trim();
      if (!trimmed || !dog) {
        setEditingName(false);
        return;
      }
      dispatch(setDogName(trimmed));
      setEditingName(false);
    },
    [dispatch, draftName, dog]
  );

  if (!dog) {
    return (
      <section className="py-8 text-center text-sm text-zinc-300">
        <p>You don&apos;t have a pup yet.</p>
        <p className="mt-1">
          Go to{" "}
          <span className="font-semibold text-emerald-300">
            Adopt
          </span>{" "}
          to claim your first Doggerz.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      {/* Top HUD */}
      <GameTopBar
        dogName={dog.name || "Your pup"}
        level={level}
        coins={coins}
        lifeStageLabel={lifeStageLabel}
        lifeStageDay={lifeStageDay}
        timeOfDay={timeOfDay}
        moodLabel={moodLabel}
        needs={needs}
        temperamentRevealReady={temperamentRevealReady}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-start">
        {/* Stage + sprite */}
        <div className="rounded-2xl border border-zinc-800 bg-slate-950/80 p-4 shadow-lg shadow-emerald-900/30">
          <div className="flex items-center justify-between mb-3">
            {editingName ? (
              <form
                onSubmit={handleNameSave}
                className="flex items-center gap-2"
              >
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="rounded-lg border border-zinc-700 bg-slate-900 px-2 py-1 text-xs text-slate-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  autoFocus
                />
                <button
                  type="submit"
                  className="rounded-full bg-emerald-500 px-3 py-1 text-[0.7rem] font-semibold text-slate-900 hover:bg-emerald-400"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(false)}
                  className="rounded-full border border-zinc-600 px-2 py-1 text-[0.7rem] text-zinc-300 hover:border-zinc-400"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                className="text-xs text-zinc-400 hover:text-emerald-300"
                onClick={() => setEditingName(true)}
              >
                Rename {dog.name || "pup"}
              </button>
            )}

            <VoiceCommandButton />
          </div>

          <div className="flex items-center justify-center">
            <EnhancedDogSprite
              animation="idle"
              scale={2}
              showCleanlinessOverlay
              reducedMotion={false}
            />
          </div>
        </div>

        {/* Right column: needs dashboard + actions + potty card */}
        <div className="space-y-4">
          <NeedsDashboard needs={needs} />

          <CareActionsPanel
            onFeed={handleFeed}
            onPlay={handlePlay}
            onBathe={handleBathe}
            onGoPotty={handleGoPotty}
            onScoopPoop={handleScoopPoop}
            onTrain={handleTrain}
          />

          <PottyTrackerCard />
        </div>
      </div>

      {activePoll && (
        <div className="rounded-2xl border border-emerald-600/40 bg-emerald-950/30 px-4 py-3 text-xs text-emerald-50 shadow-md shadow-emerald-900/40">
          <p className="font-semibold mb-2">Your pup wants to know:</p>
          <p className="mb-3 text-emerald-100">{activePoll.prompt}</p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() =>
                handlePollResponse(activePoll.id, true)
              }
              className="rounded-full bg-emerald-500 px-4 py-1.5 text-[0.75rem] font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() =>
                handlePollResponse(activePoll.id, false)
              }
              className="rounded-full border border-emerald-400/70 px-4 py-1.5 text-[0.75rem] font-semibold text-emerald-200 hover:bg-emerald-500/10"
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
// End of src/features/game/MainGame.jsx
