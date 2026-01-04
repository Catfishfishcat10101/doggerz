// src/features/game/MainGame.jsx
// AAA-ish Backyard Sim screen (simplified + conflict-free)
// @ts-nocheck

import * as React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "firebase/auth";

import { auth, firebaseReady } from "@/firebase.js";

import GameTopBar from "@/features/game/GameTopBar.jsx";
import NeedsHUD from "@/features/game/NeedsHUD.jsx";
import MoodAndJournalPanel from "@/features/game/MoodAndJournalPanel.jsx";
import TrainingPanel from "@/features/game/TrainingPanel.jsx";
import TemperamentCard from "@/features/game/TemperamentCard.jsx";
import { useDogLifecycle } from "@/features/game/useDogLifecycle.jsx";
import GoodbyeLetter from "@/components/narrative/GoodbyeLetter.jsx";
import DogChat from "@/features/companion/DogChat.jsx";
import DreamJournal from "@/features/dreams/DreamJournal.jsx";

import WeatherFXCanvas from "@/features/game/components/WeatherFXCanvas.jsx";
import YardSetDressing from "@/features/game/components/YardSetDressing.jsx";
import YardDogActor from "@/features/game/components/YardDogActor.jsx";

import {
  selectDog,
  selectDogLifeStage,
  selectDogCleanlinessTier,
  selectDogTraining,
  feed,
  play,
  rest,
  wakeUp,
  bathe,
  goPotty,
  scoopPoop,
  addJournalEntry,
} from "@/redux/dogSlice.js";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";
import { selectUserZip } from "@/redux/userSlice.js";
import { useDayNightBackground } from "@/features/game/useDayNightBackground.jsx";
import { calculateDogAge, getSpriteForStageAndTier } from "@/utils/lifecycle.js";

function getFxMode(condition) {
  const c = String(condition || "").toLowerCase();
  if (c.includes("snow")) return "snow";
  if (c.includes("rain") || c.includes("drizzle") || c.includes("thunder")) {
    return "rain";
  }
  return "none";
}

function getPrefersReducedMotion() {
  try {
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  } catch {
    return false;
  }
}

function getPrefersReducedTransparency() {
  try {
    return window.matchMedia?.("(prefers-reduced-transparency: reduce)")?.matches;
  } catch {
    return false;
  }
}

function ActionButton({ label, onClick, tone = "default", disabled }) {
  const base =
    "rounded-2xl px-3 py-2 text-xs font-semibold border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black";
  const tones =
    tone === "primary"
      ? "border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15"
      : tone === "warn"
        ? "border-amber-400/25 bg-amber-500/10 text-amber-100 hover:bg-amber-500/15"
        : "border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${tones} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {label}
    </button>
  );
}

// Neglect detection thresholds (narrative layer only)
const NEGLECT_THRESHOLDS = {
  HUNGER_MIN: 10,
  HAPPINESS_MIN: 10,
  CLEANLINESS_MIN: 5,
  HOURS_SINCE_FED: 48,
  HOURS_SINCE_PLAYED: 72,
  HOURS_SINCE_SEEN: 48,
};

export default function MainGame() {
  const dispatch = useDispatch();

  const dog = useSelector(selectDog);
  const lifeStage = useSelector(selectDogLifeStage);
  const cleanlinessTier = useSelector(selectDogCleanlinessTier);
  const training = useSelector(selectDogTraining);
  const weather = useSelector(selectWeatherCondition);
  const zip = useSelector(selectUserZip);

  const { temperamentRevealReady, temperament } = useDogLifecycle();

  const { isNight, timeOfDayBucket } = useDayNightBackground({ zip });

  const adopted = Boolean(dog?.adoptedAt);
  const age = React.useMemo(
    () => (adopted ? calculateDogAge(Number(dog?.adoptedAt)) : null),
    [adopted, dog?.adoptedAt],
  );

  const spriteSrc = React.useMemo(
    () => getSpriteForStageAndTier(lifeStage || dog?.lifeStage, cleanlinessTier),
    [cleanlinessTier, dog?.lifeStage, lifeStage],
  );

  const reduceMotion = Boolean(getPrefersReducedMotion());
  const reduceTransparency = Boolean(getPrefersReducedTransparency());

  const fxMode = getFxMode(weather);

  const pottyComplete = Boolean(training?.potty?.completedAt);
  const [selectedCommandId, setSelectedCommandId] = React.useState("sit");
  const commands = React.useMemo(
    () => [
      { id: "sit", label: "Sit" },
      { id: "stay", label: "Stay" },
      { id: "rollOver", label: "Roll over" },
      { id: "speak", label: "Speak" },
    ],
    [],
  );

  const onLogout = React.useCallback(() => {
    try {
      if (!firebaseReady || !auth) return;
      signOut(auth).catch(() => {
        // ignore
      });
    } catch {
      // ignore
    }
  }, []);

  const now = Date.now();
  const dogName = dog?.name || "Pup";
  const level = Number(dog?.level || 1);
  const coins = Number(dog?.coins || 0);
  const tokens = Number(dog?.tokens || 0);
  const badges = Array.isArray(dog?.badges) ? dog.badges : [];
  const streakDays = Number(dog?.streak?.current || 0);

  const xpPct = (() => {
    const current = Number(dog?.xp || 0);
    const next = Number(dog?.xpToNextLevel || 0);
    if (!next || next <= 0) return 0;
    return Math.max(0, Math.min(1, current / next));
  })();

  const xpLabel = (() => {
    const current = Math.round(Number(dog?.xp || 0));
    const next = Math.round(Number(dog?.xpToNextLevel || 0));
    if (!next || next <= 0) return "";
    return `${current}/${next}`;
  })();

  const intent = String(dog?.lastAction || "idle").toLowerCase();
  const isAsleep = Boolean(dog?.isAsleep);

  // Neglect detection (narrative layer only - no logic changes)
  const [showGoodbyeLetter, setShowGoodbyeLetter] = React.useState(false);
  const [goodbyeReason, setGoodbyeReason] = React.useState('lonely');

  // Check for neglect conditions based on needs and last interaction
  React.useEffect(() => {
    if (!adopted || !dog) return;

    const memory = dog?.memory || {};
    const needs = dog?.needs || {};
    const now = Date.now();
    
    // Calculate time since last care action
    const lastFed = memory.lastFedAt || 0;
    const lastPlayed = memory.lastPlayedAt || 0;
    const lastSeen = memory.lastSeenAt || 0;
    
    const hoursSinceLastFed = (now - lastFed) / (1000 * 60 * 60);
    const hoursSinceLastPlayed = (now - lastPlayed) / (1000 * 60 * 60);
    const hoursSinceLastSeen = (now - lastSeen) / (1000 * 60 * 60);
    
    const hunger = needs.hunger || 100;
    const happiness = needs.happiness || 100;
    const cleanliness = needs.cleanliness || 100;
    
    // Severe neglect conditions (narrative trigger only)
    const severeNeglect = 
      (hunger < NEGLECT_THRESHOLDS.HUNGER_MIN && hoursSinceLastFed > NEGLECT_THRESHOLDS.HOURS_SINCE_FED) ||
      (happiness < NEGLECT_THRESHOLDS.HAPPINESS_MIN && hoursSinceLastPlayed > NEGLECT_THRESHOLDS.HOURS_SINCE_PLAYED) ||
      (cleanliness < NEGLECT_THRESHOLDS.CLEANLINESS_MIN && hoursSinceLastSeen > NEGLECT_THRESHOLDS.HOURS_SINCE_SEEN);
    
    // Only show once per session
    const hasShownThisSession = sessionStorage.getItem('doggerz:goodbyeShown');
    
    if (severeNeglect && !hasShownThisSession) {
      // Determine reason based on which need is lowest
      let reason = 'lonely';
      if (hunger < happiness && hunger < cleanliness) {
        reason = 'neglected';
      } else if (happiness < hunger && happiness < cleanliness) {
        reason = 'lonely';
      } else if (cleanliness < hunger && cleanliness < happiness) {
        reason = 'neglected';
      }
      
      setGoodbyeReason(reason);
      setShowGoodbyeLetter(true);
      sessionStorage.setItem('doggerz:goodbyeShown', 'true');
    }
  }, [adopted, dog]);

  const handleGoodbyeClose = React.useCallback(() => {
    setShowGoodbyeLetter(false);
  }, []);

  const handleRedemption = React.useCallback(() => {
    // Add a journal entry about the redemption
    dispatch(addJournalEntry({
      timestamp: Date.now(),
      type: 'redemption',
      summary: `${dogName} came back! They saw you were trying to make things right.`,
      body: `After wandering away, ${dogName} couldn't stay away for long. The bond you share brought them home. This is a second chance - let's make it count!`,
      moodTag: 'hopeful',
    }));
    
    setShowGoodbyeLetter(false);
    
    // Clear the session flag so they can continue playing
    sessionStorage.removeItem('doggerz:goodbyeShown');
  }, [dispatch, dogName]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-950 to-emerald-950/20 text-white">
      {/* Stage */}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-black/25" />
        <WeatherFXCanvas
          mode={fxMode}
          reduceMotion={reduceMotion}
          reduceTransparency={reduceTransparency}
          className="absolute inset-0"
        />
        <YardSetDressing isNight={isNight} />

        <div className="absolute inset-0 flex items-end justify-center pb-24">
          <YardDogActor
            spriteSrc={spriteSrc}
            lifeStageStage={String(
              lifeStage?.stage || lifeStage?.stageId || age?.stageId || "PUPPY",
            )}
            reduceMotion={reduceMotion}
            reduceTransparency={reduceTransparency}
            isNight={isNight}
            isAsleep={isAsleep}
            intent={intent}
            useRig={false}
            useSpritePack
          />
        </div>
      </div>

      <div className="relative z-10">
        <GameTopBar
          dogName={dogName}
          level={level}
          xpPct={xpPct}
          xpLabel={xpLabel}
          coins={coins}
          tokens={tokens}
          badges={badges}
          onLogout={onLogout}
          lifeStageLabel={age?.stageLabel || "Puppy"}
          lifeStageDay={Number(age?.days || 0) + 1}
          moodLabel={String(dog?.mood?.current || "Content")}
          streakDays={streakDays}
        />

        {!adopted ? (
          <main className="mx-auto max-w-3xl p-6">
            <div className="rounded-3xl border border-white/15 bg-black/35 backdrop-blur-md p-6 shadow-[0_0_60px_rgba(0,0,0,0.18)]">
              <h1 className="text-xl font-extrabold text-emerald-200">
                Adopt a pup to start
              </h1>
              <p className="mt-2 text-sm text-zinc-200/90">
                Your yard is ready, but you don&apos;t have a dog yet.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/adopt"
                  className="rounded-2xl px-4 py-2 text-sm font-semibold border border-emerald-400/35 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15 transition"
                >
                  Go to Adopt
                </Link>
                <Link
                  to="/help"
                  className="rounded-2xl px-4 py-2 text-sm font-semibold border border-white/15 bg-black/25 text-zinc-100 hover:bg-black/35 transition"
                >
                  Help
                </Link>
              </div>
            </div>
          </main>
        ) : (
          <main className="mx-auto max-w-7xl p-4 grid gap-4 lg:grid-cols-[340px,1fr,340px]">
            <div className="space-y-4">
              <NeedsHUD />
              <MoodAndJournalPanel />
            </div>

            <div className="space-y-4">
              <section className="rounded-3xl border border-white/15 bg-black/35 backdrop-blur-md p-4 shadow-[0_0_60px_rgba(0,0,0,0.18)]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
                      Yard
                    </div>
                    <div className="mt-0.5 text-sm font-extrabold text-emerald-200">
                      Actions
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      Weather
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">
                      {String(weather || "unknown")}
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {String(timeOfDayBucket || "local")}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <ActionButton
                    label="Feed"
                    tone="primary"
                    onClick={() => dispatch(feed({ now }))}
                  />
                  <ActionButton
                    label="Play"
                    onClick={() =>
                      dispatch(
                        play({
                          now,
                          timeOfDay: String(timeOfDayBucket || "").toUpperCase(),
                        }),
                      )
                    }
                  />
                  <ActionButton
                    label="Bathe"
                    onClick={() => dispatch(bathe({ now }))}
                  />
                  <ActionButton
                    label="Potty"
                    onClick={() => dispatch(goPotty({ now }))}
                  />
                  <ActionButton
                    label="Scoop"
                    onClick={() => dispatch(scoopPoop({ now }))}
                  />
                  {isAsleep ? (
                    <ActionButton
                      label="Wake"
                      tone="warn"
                      onClick={() => dispatch(wakeUp())}
                    />
                  ) : (
                    <ActionButton
                      label="Rest"
                      tone="warn"
                      onClick={() => dispatch(rest({ now }))}
                    />
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-4">
              <TrainingPanel
                pottyComplete={pottyComplete}
                trainingInputMode="voice"
                allowButtonTraining
                allowVoiceTraining
                commands={commands}
                selectedCommandId={selectedCommandId}
                onSelectCommand={setSelectedCommandId}
              />
            </div>
          </main>
        )}
      </div>

      {/* Temperament reveal */}
      <TemperamentCard
        temperament={temperamentRevealReady ? temperament : null}
      />

      {/* Goodbye Letter (Neglect Scenario) */}
      {showGoodbyeLetter && (
        <GoodbyeLetter
          dogName={dogName}
          reason={goodbyeReason}
          onClose={handleGoodbyeClose}
          onRedemption={handleRedemption}
        />
      )}

      {/* Dog Companion Chat */}
      {adopted && <DogChat />}

      {/* Dream Journal */}
      {adopted && <DreamJournal isAsleep={isAsleep} />}
    </div>
  );
}
