// src/features/game/MainGame.jsx
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
import PersonalityPanel from "@/features/game/PersonalityPanel.jsx";
import { useDogLifecycle } from "@/features/game/useDogLifecycle.jsx";
import WeatherFXCanvas from "@/components/WeatherFXCanvas.jsx";
import DogPixiView from "@/components/DogPixiView.jsx";
import { useToast } from "@/components/ToastProvider.jsx";
import DogMomentPanel from "@/features/game/DogMomentPanel.jsx";
import DreamSequence from "@/features/dreams/DreamSequence.jsx";
import DynamicMusicSystem from "@/features/audio/DynamicMusicSystem.jsx";
import { collectEarnedBadgeIds } from "@/utils/badges.js";
import { selectDogRenderModel } from "@/features/dog/dogSelectors.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { useYardSfx } from "@/components/useYardSfx.js";
import {
  selectDog,
  selectDogLifeStage,
  selectDogCleanlinessTier,
  selectDogTraining,
  ackTemperamentReveal,
  petDog,
  feed,
  giveWater,
  play,
  rest,
  wakeUp,
  bathe,
  goPotty,
  scoopPoop,
  dismissActiveDream,
  LEVEL_XP_STEP,
} from "@/redux/dogSlice.js";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";
import { selectUserZip } from "@/redux/userSlice.js";
import { useDayNightBackground } from "@/features/game/useDayNightBackground.jsx";
import {
  calculateDogAge,
  getSpriteForStageAndTier,
} from "@/utils/lifecycle.js";

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

const MOOD_LABEL_ALIASES = {
  exhaused: "Exhausted",
};

/**
 * @typedef {Object.<string, string>} MoodLabelAliases
 */

function formatMoodLabel(raw) {
  const text = String(raw || "").trim();
  if (!text) return "Content";
  const key = text.toLowerCase();
  if (MOOD_LABEL_ALIASES[key]) return MOOD_LABEL_ALIASES[key];
  const segments = key.split(/[\s_-]+/).filter(Boolean);
  if (!segments.length) return "Content";
  return segments
    .map((segment) => {
      if (!segment) return "";
      return `${segment.charAt(0).toUpperCase()}${segment.slice(1)}`;
    })
    .join(" ");
}

export default function MainGame() {
  const dispatch = useDispatch();
  const toast = useToast();

  const dog = useSelector(selectDog);
  const lifeStage = useSelector(selectDogLifeStage);
  const cleanlinessTier = useSelector(selectDogCleanlinessTier);
  const training = useSelector(selectDogTraining);
  const weather = useSelector(selectWeatherCondition);
  const zip = useSelector(selectUserZip);
  const settings = useSelector(selectSettings);

  const { playBark, playWhine, playScratch } = useYardSfx(settings);

  const { temperamentRevealReady, temperament } = useDogLifecycle();

  const { timeOfDayBucket, style: yardStyle } = useDayNightBackground({ zip });

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

  const renderModel = React.useMemo(() => selectDogRenderModel(dog), [dog]);

  const reduceMotion = Boolean(getPrefersReducedMotion());
  const reduceTransparency = Boolean(getPrefersReducedTransparency());

  const fxMode = getFxMode(weather);

  const pottyComplete = Boolean(training?.potty?.completedAt);
  const [selectedCommandId, setSelectedCommandId] = React.useState("sit");
  const commands = React.useMemo(
    () => [
      { id: "sit", label: "Sit" },
      { id: "stay", label: "Stay" },
      { id: "down", label: "Down" },
      { id: "come", label: "Come" },
      { id: "heel", label: "Heel" },
      { id: "rollOver", label: "Roll over" },
      { id: "spin", label: "Spin" },
      { id: "jump", label: "Jump" },
      { id: "shake", label: "Shake" },
      { id: "highFive", label: "High five" },
      { id: "wave", label: "Wave" },
      { id: "bow", label: "Bow" },
      { id: "playDead", label: "Play dead" },
      { id: "fetch", label: "Fetch" },
      { id: "dance", label: "Dance" },
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
  const badges = React.useMemo(() => collectEarnedBadgeIds(dog), [dog]);
  const streakDays = Number(dog?.streak?.current || 0);

  const xpStep =
    Number.isFinite(LEVEL_XP_STEP) && LEVEL_XP_STEP > 0 ? LEVEL_XP_STEP : 100;
  const normalizedLevel = Math.max(1, level);
  const xpTotal = Number(dog?.xp || 0);
  const xpForPreviousLevels = xpStep * (normalizedLevel - 1);
  const xpIntoLevel = Math.max(
    0,
    Math.min(xpStep, xpTotal - xpForPreviousLevels)
  );
  const xpPct = xpStep > 0 ? Math.min(1, xpIntoLevel / xpStep) : 0;
  const xpLabel = `${Math.round(xpIntoLevel)}/${xpStep}`;

  const intent = String(dog?.lastAction || "idle").toLowerCase();
  const isAsleep = Boolean(dog?.isAsleep);
  const activeDream = dog?.dreams?.active || null;
  const moodTag = dog?.mood?.history?.[0]?.tag || null;
  const rawMoodLabel =
    dog?.mood?.current || dog?.mood?.history?.[0]?.tag || "Content";
  const moodLabel = React.useMemo(
    () => formatMoodLabel(rawMoodLabel),
    [rawMoodLabel]
  );

  // Lightweight action-driven SFX (only on state transitions).
  const sfxPrevRef = React.useRef({
    action: null,
    trained: null,
    cue: null,
  });
  React.useEffect(() => {
    if (!dog?.adoptedAt) return;

    const action = String(dog?.lastAction || "");
    const trained = String(dog?.memory?.lastTrainedCommandId || "");
    const cue = String(dog?.emotionCue || "");
    const prev = sfxPrevRef.current || {};

    if (action && action !== prev.action) {
      if (action === "train" && trained === "speak") {
        playBark?.({ throttleMs: 650 });
      } else if (action === "scratch") {
        playScratch?.({ throttleMs: 500 });
      } else if (action === "accident") {
        playWhine?.({ throttleMs: 900 });
      }
    }

    if (cue && cue !== prev.cue) {
      if (cue === "hungry" || cue === "thirsty") {
        playWhine?.({ throttleMs: 1400 });
      }
    }

    sfxPrevRef.current = { action, trained, cue };
  }, [
    dog?.adoptedAt,
    dog?.emotionCue,
    dog?.lastAction,
    dog?.memory?.lastTrainedCommandId,
    playBark,
    playScratch,
    playWhine,
  ]);

  const [pixiStatus, setPixiStatus] = React.useState("loading");
  const [dogView, setDogView] = React.useState({ w: 420, h: 300, scale: 2.6 });

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const calc = () => {
      const maxW = 520;
      const minW = 280;
      const available = Math.max(0, (window.innerWidth || maxW) - 120);
      const w = Math.max(minW, Math.min(maxW, available));
      const h = Math.round((w * 300) / 420);
      const scale = 2.6 * (w / 420);
      setDogView({ w, h, scale });
    };

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  const [showTemperament, setShowTemperament] = React.useState(false);

  const TEMPERAMENT_REVEAL_XP = 20;

  React.useEffect(() => {
    if (!temperamentRevealReady || showTemperament) return;
    const now = Date.now();
    setShowTemperament(true);
    dispatch(ackTemperamentReveal({ now, xp: TEMPERAMENT_REVEAL_XP }));

    const primary = temperament?.primary || "Unknown";
    const secondary = temperament?.secondary;
    const label = secondary ? `${primary} / ${secondary}` : primary;
    toast.reward(
      `Temperament discovered: ${label} (+${TEMPERAMENT_REVEAL_XP} XP)`
    );
  }, [
    dispatch,
    showTemperament,
    temperament?.primary,
    temperament?.secondary,
    temperamentRevealReady,
    toast,
  ]);

  React.useEffect(() => {
    if (!dog?.adoptedAt) {
      setShowTemperament(false);
    }
  }, [dog?.adoptedAt]);

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

      <div className="relative z-10">
        <GameTopBar
          dogName={dogName}
          level={level}
          xpPct={xpPct}
          xpLabel={xpLabel}
          coins={coins}
          badges={badges}
          onLogout={onLogout}
          lifeStageLabel={age?.stageLabel || "Puppy"}
          lifeStageDay={Number(age?.days || 0) + 1}
          moodLabel={moodLabel}
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
          <main className="w-full px-4 pb-12 pt-4">
            <section className="relative overflow-hidden rounded-[32px] border border-white/15 bg-black/35 shadow-[0_0_90px_rgba(0,0,0,0.25)]">
              <div className="absolute inset-0" aria-hidden>
                <div
                  className="absolute inset-0 bg-center bg-cover"
                  style={yardStyle}
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(34,197,94,0.18),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(56,189,248,0.12),transparent_45%)]" />
                <WeatherFXCanvas
                  mode={fxMode}
                  reduceMotion={reduceMotion}
                  reduceTransparency={reduceTransparency}
                  className="absolute inset-0"
                />
              </div>

              <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_360px]">
                <div className="p-5 sm:p-7 lg:p-9 space-y-5 border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <div className="text-xs uppercase tracking-[0.22em] text-zinc-200/80">
                        Backyard Scene
                      </div>
                      <div className="mt-1 text-2xl sm:text-3xl font-extrabold text-emerald-100 leading-tight">
                        {dogName} <span className="text-zinc-500">·</span>{" "}
                        {String(age?.stageLabel || "Puppy")}
                      </div>
                      <div className="mt-1 text-xs sm:text-sm text-zinc-200/90">
                        Weather:{" "}
                        <span className="font-semibold text-zinc-100">
                          {String(weather || "unknown")}
                        </span>{" "}
                        <span className="text-zinc-500">·</span>{" "}
                        <span className="text-zinc-200">
                          {String(timeOfDayBucket || "local")}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/15 bg-black/35 px-3 py-2 text-xs text-zinc-200/90">
                      XP:{" "}
                      <span className="font-semibold text-emerald-200">
                        {xpLabel || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="relative rounded-3xl border border-white/15 bg-black/20 p-4 sm:p-6 overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18),transparent_60%)]" />
                    <div
                      className="relative mx-auto"
                      style={{ width: dogView.w, height: dogView.h }}
                    >
                      <div
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          pixiStatus === "ready" ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        <DogPixiView
                          stage={renderModel.stage}
                          condition={renderModel.condition}
                          anim={renderModel.anim}
                          width={dogView.w}
                          height={dogView.h}
                          scale={dogView.scale}
                          onStatus={() => {}}
                          onStatusChange={setPixiStatus}
                        />
                      </div>

                      <div
                        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                          pixiStatus === "ready" ? "opacity-0" : "opacity-100"
                        }`}
                      >
                        <img
                          src={spriteSrc}
                          alt=""
                          draggable={false}
                          style={{
                            width: dogView.w,
                            height: dogView.h,
                            display: "block",
                            objectFit: "contain",
                            imageRendering: "auto",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <section className="rounded-3xl border border-white/15 bg-black/30 p-4 shadow-[0_0_50px_rgba(0,0,0,0.18)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.22em] text-zinc-200/80">
                          Actions
                        </div>
                        <div className="mt-0.5 text-sm font-extrabold text-emerald-200">
                          Care &amp; Play
                        </div>
                      </div>
                      <div className="text-[11px] text-zinc-300/80">
                        Tap to interact
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <ActionButton
                        label="Pet"
                        onClick={() => dispatch(petDog({ now }))}
                        disabled={false}
                      />
                      <ActionButton
                        label="Feed"
                        tone="primary"
                        onClick={() => dispatch(feed({ now }))}
                        disabled={false}
                      />
                      <ActionButton
                        label="Water"
                        tone="primary"
                        onClick={() => dispatch(giveWater({ now }))}
                        disabled={false}
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
                        disabled={false}
                      />
                      <ActionButton
                        label={isAsleep ? "Wake" : "Rest"}
                        tone={isAsleep ? "warn" : "default"}
                        onClick={() =>
                          dispatch(isAsleep ? wakeUp({ now }) : rest({ now }))
                        }
                        disabled={false}
                      />
                      <ActionButton
                        label="Bathe"
                        onClick={() => dispatch(bathe({ now }))}
                        disabled={false}
                      />
                      <ActionButton
                        label="Potty walk"
                        onClick={() => dispatch(goPotty({ now }))}
                        disabled={false}
                      />
                      <ActionButton
                        label="Scoop"
                        onClick={() => dispatch(scoopPoop({ now }))}
                        disabled={false}
                      />
                    </div>
                  </section>
                </div>

                <aside className="p-5 sm:p-7 lg:p-9 space-y-4 bg-black/30">
                  <NeedsHUD />
                  <DogMomentPanel />
                  <TrainingPanel
                    pottyComplete={pottyComplete}
                    allowButtonTraining
                    commands={commands}
                    selectedCommandId={selectedCommandId}
                    onSelectCommand={setSelectedCommandId}
                  />
                  <MoodAndJournalPanel />
                  <PersonalityPanel />
                </aside>
              </div>
            </section>
          </main>
        )}
      </div>

      {/* Temperament reveal */}
      <TemperamentCard
        temperament={showTemperament ? temperament : null}
        onClose={() => setShowTemperament(false)}
      />
    </div>
  );
}
