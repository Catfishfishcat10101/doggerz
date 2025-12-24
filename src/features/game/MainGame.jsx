// src/features/game/MainGame.jsx
// @ts-nocheck
//
// Doggerz: Main game screen
// - Shows yard, dog sprite, stats HUD, care actions, potty tracker, training.
// - Uses JackRussellSpriteView for the main dog art.

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
  selectDogTraining,
  selectDogPolls,
  feed,
  play,
  bathe,
  goPotty,
  scoopPoop,
  trainObedience,
  respondToDogPoll,
  setDogName,
  setAdoptedAt,
} from "@/redux/dogSlice.js";

import JackRussellSpriteView from "@/components/JackRussellSpriteView.jsx";
import ProgressBar from "@/components/ProgressBar.jsx";
import CareActionsPanel from "@/components/CareActionsPanel.jsx";
import PottyTrackerCard from "@/components/PottyTrackerCard.jsx";
import VoiceCommandButton from "@/components/VoiceCommandButton.jsx";
import GameTopBar from "@/features/game/components/GameTopBar.jsx";
import DogPollBanner from "@/features/game/components/DogPollBanner.jsx";
import TrainingGallery from "@/features/dashboard/TrainingGallery.jsx";

export default function MainGame() {
  const dispatch = useDispatch();

  // Core dog data
  const dog = useSelector(selectDog);
  const lifeStage = useSelector(selectDogLifeStage);
  const training = useSelector(selectDogTraining);
  const polls = useSelector(selectDogPolls);

  const [isBusy, setIsBusy] = useState(false);

  // Derive safe values
  const dogName = dog?.name || "Pup";
  const level = dog?.level || 1;
  const coins = dog?.coins || 0;

  const lifeStageLabel = lifeStage?.label || "Puppy";
  const lifeStageDay = lifeStage?.day || 1;

  const needs = {
    hunger: dog?.hunger ?? 50,
    happiness: dog?.happiness ?? 50,
    energy: dog?.energy ?? 50,
    cleanliness: dog?.cleanliness ?? 50,
  };

  const moodLabel = dog?.moodLabel || "Content";

  // Map lifeStageLabel → sprite "stage"
  const spriteStage = useMemo(() => {
    const label = (lifeStageLabel || "").toLowerCase();
    if (label.includes("senior")) return "senior";
    if (label.includes("adult")) return "adult";
    return "puppy";
  }, [lifeStageLabel]);

  // For now, keep condition simple; you can wire to cleanliness / parasites later.
  const spriteCondition = "clean";

  // --- Action handlers ------------------------------------------------------

  const withBusy = (fn) => {
    return async () => {
      if (isBusy) return;
      setIsBusy(true);
      try {
        await fn();
      } finally {
        setIsBusy(false);
      }
    };
  };

  const handleFeed = withBusy(async () => {
    dispatch(feed());
  });

  const handlePlay = withBusy(async () => {
    dispatch(play());
  });

  const handleBathe = withBusy(async () => {
    dispatch(bathe());
  });

  const handlePotty = withBusy(async () => {
    dispatch(goPotty());
  });

  const handleScoopPoop = withBusy(async () => {
    dispatch(scoopPoop());
  });

  const handleTrainObedience = withBusy(async () => {
    dispatch(trainObedience());
  });

  const handlePollResponse = useCallback(
    (optionId) => {
      if (!polls?.activePoll) return;
      dispatch(
        respondToDogPoll({
          pollId: polls.activePoll.id,
          optionId,
        }),
      );
    },
    [dispatch, polls],
  );

  // If no dog yet, we can show a simple guard. Your router/adopt flow may replace this.
  if (!dog || !dog.adoptedAt) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="text-3xl font-extrabold text-emerald-400 mb-2">
          Doggerz
        </div>
        <p className="text-zinc-400 mb-4">
          You have not adopted a pup yet.
        </p>
        <p className="text-xs text-zinc-500">
          (If this is wrong, check your Adopt → cloud save flow.)
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Top bar with name, level, coins, mood, needs */}
      <GameTopBar
        dogName={dogName}
        level={level}
        coins={coins}
        lifeStageLabel={lifeStageLabel}
        lifeStageDay={lifeStageDay}
        timeOfDay="day"
        moodLabel={moodLabel}
        needs={needs}
        temperamentRevealReady={
          dog?.temperamentRevealReady ?? false
        }
      />

      <section className="mx-auto max-w-5xl px-4 py-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Left: yard + dog sprite + potty card */}
          <div className="flex-1 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 flex flex-col items-center">
            {/* Dog sprite */}
            <JackRussellSpriteView
              stage={spriteStage}
              condition={spriteCondition}
              size={240}
              className="drop-shadow-[0_0_12px_rgba(0,0,0,0.8)]"
            />

            {/* Needs summary under dog (optional) */}
            <div className="mt-4 grid grid-cols-2 gap-2 w-full">
              <ProgressBar
                label="Hunger"
                value={needs.hunger}
                tone="emerald"
              />
              <ProgressBar
                label="Happiness"
                value={needs.happiness}
                tone="sky"
              />
              <ProgressBar
                label="Energy"
                value={needs.energy}
                tone="amber"
              />
              <ProgressBar
                label="Cleanliness"
                value={needs.cleanliness}
                tone="violet"
              />
            </div>

            {/* Potty tracker */}
            <div className="mt-4 w-full">
              <PottyTrackerCard />
            </div>
          </div>

          {/* Right: care actions, voice commands, training */}
          <div className="w-full md:w-80 space-y-4">
            <CareActionsPanel
              disabled={isBusy}
              onFeed={handleFeed}
              onPlay={handlePlay}
              onBathe={handleBathe}
              onPotty={handlePotty}
              onScoopPoop={handleScoopPoop}
              onTrainObedience={handleTrainObedience}
            />

            <VoiceCommandButton className="w-full" />

            <TrainingGallery />
          </div>
        </div>

        {/* Dog poll banner (mood questions, choices, etc.) */}
        {polls?.activePoll && (
          <DogPollBanner
            poll={polls.activePoll}
            onRespond={handlePollResponse}
          />
        )}
      </section>
    </main>
  );
}
