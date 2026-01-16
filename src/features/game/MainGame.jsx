// src/features/game/MainGame.jsx
// AAA-ish Backyard Sim screen (simplified + conflict-free)
// @ts-nocheck

import * as React from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signOut } from "firebase/auth";
import { auth, firebaseReady } from "@/firebase.js";
import PuppyAnimator from "@/features/game/components/PuppyAnimator.jsx";
import GameTopBar from "@/features/game/GameTopBar.jsx";
import NeedsHUD from "@/features/game/NeedsHUD.jsx";
import MoodAndJournalPanel from "@/features/game/MoodAndJournalPanel.jsx";
import TrainingPanel from "@/features/game/TrainingPanel.jsx";
import TemperamentCard from "@/features/game/TemperamentCard.jsx";
import PersonalityPanel from "@/features/game/PersonalityPanel.jsx";
import { useDogLifecycle } from "@/features/game/useDogLifecycle.jsx";
import WeatherFXCanvas from "@/components/WeatherFXCanvas.jsx";
import YardSetDressing from "@/components/YardSetDressing.jsx";
import YardDogActor from "@/components/YardDogActor.jsx";
import DogMomentPanel from "@/features/game/DogMomentPanel.jsx";
import DreamSequence from "@/features/dreams/DreamSequence.jsx";
import DynamicMusicSystem from "@/features/audio/DynamicMusicSystem.jsx";
import {
  selectDog,
  selectDogLifeStage,
  selectDogCleanlinessTier,
  selectDogTraining,
  feed,
  play,
  bathe,
  goPotty,
  scoopPoop,
  dismissActiveDream,
} from "@/redux/dogSlice.js";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";
import { selectUserZip } from "@/redux/userSlice.js";
import { useDayNightBackground } from "@/features/game/useDayNightBackground.jsx";
import {
  calculateDogAge,
  getSpriteForStageAndTier,
} from "@/utils/lifecycle.js";

function mapTrainingCommandToPuppyAction(commandId) {
  const cmd = String(commandId || "")
    .trim()
    .toLowerCase();
  if (!cmd) return "sit";

  // Match current available sheets in /public/sprites/puppy/actions
  if (cmd === "sit" || cmd === "stay") return "sit";
  if (cmd === "speak") return "bark";

  // TrainingPanel uses camelCase (e.g. rollOver). After lowercasing we see "rollover".
  if (cmd === "rollover" || cmd === "roll_over") return "walk";

  return "sit";
}

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
    return window.matchMedia?.("(prefers-reduced-transparency: reduce)")
      ?.matches;
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

export default function MainGame() {
  const dispatch = useDispatch();

  const dog = useSelector(selectDog);
  const lifeStage = useSelector(selectDogLifeStage);
  const cleanlinessTier = useSelector(selectDogCleanlinessTier);
  const training = useSelector(selectDogTraining);
  const weather = useSelector(selectWeatherCondition);
  const zip = useSelector(selectUserZip);

  const { temperamentRevealReady, temperament } = useDogLifecycle();

  const {
    isNight,
    timeOfDayBucket,
    style: yardStyle,
  } = useDayNightBackground({ zip });

  const adopted = Boolean(dog?.adoptedAt);
  const age = React.useMemo(
    () => (adopted ? calculateDogAge(Number(dog?.adoptedAt)) : null),
    [adopted, dog?.adoptedAt]
  );

  const spriteSrc = React.useMemo(
    () =>
      getSpriteForStageAndTier(lifeStage || dog?.lifeStage, cleanlinessTier),
    [cleanlinessTier, dog?.lifeStage, lifeStage]
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
    []
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
  const activeDream = dog?.dreams?.active || null;
  const moodTag = dog?.mood?.history?.[0]?.tag || null;
  const lastTrainedCommandId = dog?.memory?.lastTrainedCommandId || null;

  const stageId = String(
    lifeStage?.stage || lifeStage?.stageId || age?.stageId || "PUPPY"
  ).toUpperCase();

  const isPuppy = stageId === "PUPPY" || stageId === "PUP";

  // PuppyAnimator uses the lightweight public sprites at /sprites/puppy/actions/*.
  // Map training commands to the currently-available action set.
  const puppyAction = React.useMemo(() => {
    if (isAsleep || intent === "sleep" || intent === "rest") return "sleep";

    if (intent === "train") {
      return mapTrainingCommandToPuppyAction(
        lastTrainedCommandId || selectedCommandId
      );
    }

    if (intent === "bark" || intent === "howl") return "bark";
    if (
      intent === "walk" ||
      intent === "run" ||
      intent === "play" ||
      intent === "fetch" ||
      intent === "potty"
    ) {
      return "walk";
    }

    return "idle";
  }, [isAsleep, intent, lastTrainedCommandId, selectedCommandId]);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-950 to-emerald-950/20 text-white">
      <DynamicMusicSystem
        timeOfDay={timeOfDayBucket}
        weather={weather}
        moodTag={moodTag}
        stats={dog?.stats}
        activity={intent}
        isAsleep={isAsleep}
      />
      <DreamSequence
        dream={isAsleep ? activeDream : null}
        onDismiss={() => dispatch(dismissActiveDream())}
      />

      {/* Stage */}
      <div className="absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 bg-center bg-cover"
          style={yardStyle}
        />
        <div className="absolute inset-0 bg-black/15" />
        <WeatherFXCanvas
          mode={fxMode}
          reduceMotion={reduceMotion}
          reduceTransparency={reduceTransparency}
          className="absolute inset-0"
        />
        <YardSetDressing isNight={isNight} />

        <div className="absolute inset-0 flex items-end justify-center pb-24">
          {isPuppy ? (
            <PuppyAnimator
              action={puppyAction}
              size={256}
              fallbackSrc={spriteSrc}
            />
          ) : (
            <YardDogActor
              spriteSrc={spriteSrc}
              lifeStageStage={stageId}
              reduceMotion={reduceMotion}
              reduceTransparency={reduceTransparency}
              isNight={isNight}
              isAsleep={isAsleep}
              intent={intent}
              commandId={intent === "train" ? lastTrainedCommandId : undefined}
              cosmeticsEquipped={dog?.cosmetics?.equipped}
              useRig={false}
              useSpritePack={false}
            />
          )}
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
          <main className="mx-auto w-full max-w-[1400px] px-6 pb-10 pt-4 grid gap-6 lg:grid-cols-[minmax(280px,360px)_minmax(0,1fr)_minmax(280px,360px)]">
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
                          timeOfDay: String(
                            timeOfDayBucket || ""
                          ).toUpperCase(),
                        })
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
                </div>
              </section>

              <PersonalityPanel />
            </div>

            <div className="space-y-4">
              <DogMomentPanel />
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
    </div>
  );
}
