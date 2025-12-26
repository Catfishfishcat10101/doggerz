// src/pages/Game.jsx

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectDog,
  selectDogLifeStage,
  selectDogStats,
  selectDogSkills,
  selectDogMood,
  feed,
  play,
  bathe,
  goPotty,
  rest,
  trainObedience,
} from "@/redux/dogSlice.js";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";

import EnhancedDogSprite from "@/components/EnhancedDogSprite.jsx";
import ProgressBar from "@/components/ProgressBar.jsx";
import VoiceCommandButton from "@/components/VoiceCommandButton.jsx";
import { selectSettings } from "@/redux/settingsSlice.js";
import PageShell from "@/components/PageShell.jsx";
import { useToast } from "@/components/toast/ToastProvider.jsx";

import GameTopBar from "@/features/game/GameTopBar.jsx";
import NeedsHUD from "@/features/game/NeedsHUD.jsx";
import MoodAndJournalPanel from "@/features/game/MoodAndJournalPanel.jsx";
import TemperamentCard from "@/features/game/TemperamentCard.jsx";
import useDayNightBackground from "@/features/game/useDayNightBackground.jsx";
import { useDogLifecycle } from "@/features/game/useDogLifecycle.jsx";

export default function GamePage() {
  const dispatch = useDispatch();
  const toast = useToast();

  const dog = useSelector(selectDog);
  const stats = useSelector(selectDogStats);
  const skills = useSelector(selectDogSkills);
  const stage = useSelector(selectDogLifeStage);
  const mood = useSelector(selectDogMood);
  const settings = useSelector(selectSettings);
  const weather = useSelector(selectWeatherCondition);

  const dayNight = useDayNightBackground();
  const lifecycle = useDogLifecycle();

  const name = dog?.name || "Pup";
  const level = dog?.level || 1;
  const coins = dog?.coins || 0;
  const hunger = stats?.hunger ?? 50;
  const happiness = stats?.happiness ?? 60;
  const energy = stats?.energy ?? 60;
  const cleanliness = stats?.cleanliness ?? 60;

  const lastMoodTag = mood?.history?.[0]?.tag || "NEUTRAL";
  const moodLabel =
    lastMoodTag === "HAPPY"
      ? "Happy"
      : lastMoodTag === "HUNGRY"
        ? "Hungry"
        : lastMoodTag === "SLEEPY"
          ? "Sleepy"
          : lastMoodTag === "DIRTY"
            ? "Dirty"
            : lastMoodTag === "LONELY"
              ? "Lonely"
              : "Chillin'";

  const obedienceSkills = skills?.obedience || {};
  const obedienceAvg = (() => {
    const vals = Object.values(obedienceSkills).map((s) => Number(s?.level || 0));
    if (!vals.length) return 0;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  })();

  const coach = (() => {
    if (hunger >= 75) return "I’m starving. Food first.";
    if (energy <= 25) return "I’m sleepy. Play later—let me rest.";
    if (cleanliness <= 30) return "Bath time… I rolled in something legendary.";
    if (happiness <= 35) return "I need attention. Let’s play!";
    return "We’re doing great. Want to train a trick?";
  })();

  const weatherLabel = (() => {
    const w = String(weather || "sun").toLowerCase();
    if (w === "rain") return "Rain";
    if (w === "snow") return "Snow";
    return "Sun";
  })();

  const doFeed = () => {
    dispatch(feed());
    toast.success("Snack served: hunger down, happiness up");
  };

  const doPlay = () => {
    dispatch(play());
    toast.info("Playtime: happiness up, energy down");
  };

  const doPotty = () => {
    dispatch(goPotty());
    toast.success("Potty break logged. Good pup energy.");
  };

  const doBathe = () => {
    dispatch(bathe());
    toast.info("Bath time: cleanliness up (grumpy but fresh)");
  };

  const doRest = () => {
    dispatch(rest());
    toast.info("Power nap initiated: energy up");
  };

  const doTrain = () => {
    // Default to a simple command so the button is meaningful even without voice.
    dispatch(trainObedience({ commandId: "sit", success: true }));
    toast.success('Training: practiced "sit"');
  };

  const lastLevelRef = React.useRef(level);
  React.useEffect(() => {
    if (level > (lastLevelRef.current || 1)) {
      toast.push({
        title: "Level up!",
        message: `You're now level ${level}.`,
        tone: "success",
        durationMs: 2400,
      });
    }
    lastLevelRef.current = level;
  }, [level, toast]);

  const lastTemperamentReadyRef = React.useRef(
    Boolean(lifecycle?.temperamentRevealReady)
  );
  React.useEffect(() => {
    const ready = Boolean(lifecycle?.temperamentRevealReady);
    if (ready && !lastTemperamentReadyRef.current) {
      toast.push({
        title: "Temperament reveal unlocked",
        message: "Your pup's personality is ready to discover.",
        tone: "info",
        durationMs: 3200,
      });
    }
    lastTemperamentReadyRef.current = ready;
  }, [lifecycle?.temperamentRevealReady, toast]);

  return (
    <PageShell
      mainClassName="p-0"
      constrainWidth={false}
      style={dayNight?.style}
    >
      <div className="min-h-dvh pb-24">
        <GameTopBar
          dogName={name}
          level={level}
          coins={coins}
          lifeStageLabel={stage?.label || "Puppy"}
          lifeStageDay={Math.max(1, Math.round(stage?.days || 1))}
          moodLabel={moodLabel}
          needs={{ hunger, happiness, energy, cleanliness }}
        />

        <div className="mx-auto w-full max-w-5xl px-4 pt-5">
          <div className="grid gap-6 lg:grid-cols-[340px_1fr] items-start">
            {/* Main */}
            <section className="flex flex-col items-center">
              {/* Immersion chips + coach */}
              <div className="w-full max-w-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-200">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      Weather
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {weatherLabel}
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/70 px-3 py-1 text-xs text-zinc-700 dark:border-zinc-800 dark:bg-black/30 dark:text-zinc-200">
                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                      Coach
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {coach}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dog Sprite */}
              <div className="scale-110 mt-4">
                <EnhancedDogSprite />
              </div>

              {/* Stats */}
              <div className="w-full max-w-sm mt-6 space-y-4">
                <ProgressBar label="Hunger" value={hunger} tone="amber" />
                <ProgressBar label="Happiness" value={happiness} tone="emerald" />
                <ProgressBar label="Energy" value={energy} tone="sky" />
                <ProgressBar label="Cleanliness" value={cleanliness} tone="violet" />
                <ProgressBar
                  label="Training (avg)"
                  value={Math.min(100, obedienceAvg * 10)}
                  tone="blue"
                />
              </div>

              {/* Desktop buttons */}
              <div className="mt-8 hidden sm:grid grid-cols-2 gap-3 w-full max-w-sm">
                <button
                  onClick={doFeed}
                  className="py-2 bg-emerald-600/70 rounded-lg shadow hover:bg-emerald-600"
                >
                  Feed
                </button>
                <button
                  onClick={doPlay}
                  className="py-2 bg-blue-600/70 rounded-lg shadow hover:bg-blue-600"
                >
                  Play
                </button>
                <button
                  onClick={doPotty}
                  className="py-2 bg-yellow-600/70 rounded-lg shadow hover:bg-yellow-600"
                >
                  Potty
                </button>
                <button
                  onClick={doBathe}
                  className="py-2 bg-indigo-600/70 rounded-lg shadow hover:bg-indigo-600"
                >
                  Bathe
                </button>
                <button
                  onClick={doTrain}
                  className="col-span-2 py-2 bg-purple-600/70 rounded-lg shadow hover:bg-purple-600"
                >
                  Train
                </button>
                <button
                  onClick={doRest}
                  className="col-span-2 py-2 bg-zinc-900/70 rounded-lg shadow hover:bg-zinc-900"
                >
                  Rest
                </button>
              </div>

              {/* Voice Command */}
              {settings?.voiceCommandsEnabled ? (
                <div className="mt-6">
                  <VoiceCommandButton />
                </div>
              ) : null}
            </section>

            {/* Side panels */}
            <aside className="space-y-4">
              <NeedsHUD />
              <MoodAndJournalPanel />

              {dayNight?.error ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-950 dark:text-amber-200">
                  Day/night sync is running in local-only mode.
                </div>
              ) : null}
            </aside>
          </div>
        </div>

        {/* Mobile sticky action dock */}
        <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
          <div className="mx-auto max-w-md px-3 pb-3">
            <div className="rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur-md shadow-lg shadow-black/10 dark:border-zinc-800 dark:bg-zinc-950/70 dark:shadow-black/30">
              <div className="grid grid-cols-5 gap-1 p-2">
                <button
                  type="button"
                  onClick={doFeed}
                  className="rounded-xl bg-emerald-600/15 text-emerald-800 dark:text-emerald-200 px-2 py-3 text-[11px] font-semibold"
                  aria-label="Feed"
                >
                  Feed
                </button>
                <button
                  type="button"
                  onClick={doPlay}
                  className="rounded-xl bg-sky-600/15 text-sky-900 dark:text-sky-200 px-2 py-3 text-[11px] font-semibold"
                  aria-label="Play"
                >
                  Play
                </button>
                <button
                  type="button"
                  onClick={doPotty}
                  className="rounded-xl bg-amber-500/15 text-amber-900 dark:text-amber-200 px-2 py-3 text-[11px] font-semibold"
                  aria-label="Potty"
                >
                  Potty
                </button>
                <button
                  type="button"
                  onClick={doBathe}
                  className="rounded-xl bg-indigo-600/15 text-indigo-900 dark:text-indigo-200 px-2 py-3 text-[11px] font-semibold"
                  aria-label="Bathe"
                >
                  Bath
                </button>
                <button
                  type="button"
                  onClick={doTrain}
                  className="rounded-xl bg-violet-600/15 text-violet-900 dark:text-violet-200 px-2 py-3 text-[11px] font-semibold"
                  aria-label="Train"
                >
                  Train
                </button>
              </div>
            </div>
          </div>
        </div>

        {lifecycle?.temperamentRevealReady ? (
          <TemperamentCard temperament={lifecycle?.temperament} />
        ) : null}
      </div>
    </PageShell>
  );
}
