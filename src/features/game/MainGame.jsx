// src/features/game/MainGame.jsx
// @ts-nocheck

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
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
import ProgressBar from "@/components/ProgressBar.jsx";
import VoiceCommandButton from "@/components/VoiceCommandButton.jsx";
import CareActionsPanel from "@/components/CareActionsPanel.jsx";
import PottyTrackerCard from "@/components/PottyTrackerCard.jsx";
import { getTimeOfDay } from "@/utils/weather.js";
import { fetchWeatherByZip } from "@/utils/realWeather.js";
import { getCleanlinessEffects } from "@/constants/game.js";
import { useDogLifecycle } from "@/features/game/useDogLifecycle.jsx";
import GameTopBar from "@/components/GameTopBar.jsx";
import NeedsHUD from "@/components/NeedsHUD.jsx";
import SessionTimer from "@/components/SessionTimer.jsx";
import LevelUpCelebration from "@/components/LevelUpCelebration.jsx";
import { selectUserCoins } from "@/redux/userSlice.js";

const TIME_OVERLAY = {
  dawn: "linear-gradient(180deg, rgba(255,209,143,0.5) 0%, rgba(15,23,42,0.7) 100%)",
  morning:
    "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(15,23,42,0.5) 100%)",
  afternoon:
    "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(15,23,42,0.45) 65%, rgba(2,6,23,0.6) 100%)",
  dusk: "linear-gradient(180deg, rgba(255,164,119,0.4) 0%, rgba(2,6,23,0.8) 100%)",
  evening:
    "linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(2,6,23,0.85) 100%)",
  night:
    "linear-gradient(180deg, rgba(2,6,23,0.4) 0%, rgba(0,0,0,0.9) 100%)",
};

/**
 * MainGame is the core “in-yard” experience:
 * - Left: animated yard & dog sprite
 * - Right: stats + basic care actions
 */
export default function MainGame() {
  const dispatch = useDispatch();
  const { temperamentRevealReady } = useDogLifecycle();

  const dog = useSelector(selectDog);
  const lifeStage = useSelector(selectDogLifeStage);
  const userCoins = useSelector(selectUserCoins);
  const pollState = useSelector(selectDogPolls);
  const training = useSelector(selectDogTraining);

  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [actionToast, setActionToast] = useState(null);
  const [pollCountdown, setPollCountdown] = useState(0);
  const [reminderToast, setReminderToast] = useState(null);
  const [weather, setWeather] = useState(null);
  const [spriteAnim, setSpriteAnim] = useState("idle");
  const [showSpriteQA, setShowSpriteQA] = useState(
    Boolean(import.meta.env && import.meta.env.DEV)
  );
  const [showOverlay, setShowOverlay] = useState(() => {
    const v = localStorage.getItem("doggerz.setting.showOverlay");
    return v == null ? true : v === "true";
  });
  const [reducedMotion, setReducedMotion] = useState(() => {
    const v = localStorage.getItem("doggerz.setting.reducedMotion");
    return v === "true";
  });
  const [devHintVisible, setDevHintVisible] = useState(
    Boolean(import.meta.env && import.meta.env.DEV)
  );
  const [showNeedsHUD, setShowNeedsHUD] = useState(() => {
    const v = localStorage.getItem("doggerz.setting.showNeedsHUD");
    return v == null ? true : v === "true";
  });

  const toastTimeoutRef = useRef(null);
  const reminderTimeoutRef = useRef(null);
  const reminderKeyRef = useRef(null);

  const activePoll = pollState?.active || null;

  // ---------- Derived state (safe for "no dog" too) ----------

  const dogName = dog?.name || "Pup";
  const level = Number.isFinite(dog?.level) ? dog.level : 1;
  const coins = Number.isFinite(userCoins) ? userCoins : 0;

  const lifeStageKey = lifeStage?.stage || "PUPPY";
  const lifeStageLabel =
    lifeStage?.label || (lifeStageKey === "PUPPY" ? "Puppy" : lifeStageKey);
  const lifeStageDay = lifeStage?.days ?? 0;

  const trainingState = training || {};
  const pottyTraining = trainingState.potty || {};
  const pottyGoal = pottyTraining.goal || 0;
  const pottySuccess = pottyTraining.successCount || 0;
  const pottyTrainingComplete = Boolean(pottyTraining.completedAt);
  const pottyProgress = pottyGoal
    ? Math.min(1, pottySuccess / pottyGoal)
    : pottyTrainingComplete
      ? 1
      : 0;

  const adultTraining = trainingState.adult || {};
  const todayIso = new Date().toISOString().slice(0, 10);
  const adultLastCompleted = adultTraining.lastCompletedDate || null;
  const adultTrainingDoneToday = adultLastCompleted === todayIso;
  const isPuppy = lifeStageKey === "PUPPY";

  const hunger = Math.round(dog?.hunger ?? 0);
  const happiness = Math.round(dog?.happiness ?? 0);
  const energy = Math.round(dog?.energy ?? 0);
  const cleanliness = Math.round(dog?.cleanliness ?? 0);

  const moodLabel = dog?.mood?.label || "Calibrating vibe…";
  const needs = useMemo(
    () => ({ hunger, happiness, energy, cleanliness }),
    [hunger, happiness, energy, cleanliness]
  );

  const poopCount = dog?.poopCount ?? 0;
  const pottyLevel = Math.round(dog?.pottyLevel ?? 0);

  const pottyStatusLabel = (() => {
    if (pottyLevel >= 75) return "Emergency walk NOW";
    if (pottyLevel >= 50) return "Itching to go";
    if (pottyLevel >= 25) return "Ready for a break";
    return "All good";
  })();

  const yardStatusLabel = (() => {
    if (poopCount === 0) return "Yard is spotless";
    if (poopCount === 1) return "One pile waiting";
    return `${poopCount} piles waiting`;
  })();

  const cleanlinessEffects = getCleanlinessEffects(cleanliness);
  const cleanlinessLabel = cleanlinessEffects.label || "Fresh";
  const cleanlinessSummary =
    cleanlinessEffects.journalSummary || "Freshly pampered and glowing.";

  const overlayStyle = {
    background: TIME_OVERLAY[timeOfDay] || TIME_OVERLAY.afternoon,
  };

  // Level-up celebration state
  const prevLevelRef = useRef(level);
  const [levelUp, setLevelUp] = useState(null);
  useEffect(() => {
    const prev = prevLevelRef.current;
    if (level > prev) {
      setLevelUp(level);
      const t = setTimeout(() => setLevelUp(null), 3000);
      return () => clearTimeout(t);
    }
    prevLevelRef.current = level;
  }, [level]);

  const hasDog = !!dog;
  const isAdopted = !!dog?.adoptedAtMs;

  // ---------- Effects & callbacks (hooks in stable order) ----------

  // Time-of-day ticker
  useEffect(() => {
    const id = setInterval(() => setTimeOfDay(getTimeOfDay()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Real weather fetch (optional, gated by Settings)
  useEffect(() => {
    const useReal =
      localStorage.getItem("doggerz.setting.useRealWeather") === "true";
    const zip = localStorage.getItem("doggerz.setting.zip") || "";
    let cancelled = false;
    if (!useReal || !zip) {
      setWeather(null);
      return;
    }
    (async () => {
      const data = await fetchWeatherByZip(zip);
      if (!cancelled) setWeather(data);
    })();
    const id = setInterval(async () => {
      const data = await fetchWeatherByZip(zip);
      if (!cancelled) setWeather(data);
    }, 10 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem("doggerz.setting.showOverlay", String(showOverlay));
    } catch { }
  }, [showOverlay]);
  useEffect(() => {
    try {
      localStorage.setItem(
        "doggerz.setting.reducedMotion",
        String(reducedMotion)
      );
    } catch { }
  }, [reducedMotion]);
  useEffect(() => {
    try {
      localStorage.setItem(
        "doggerz.setting.showNeedsHUD",
        String(showNeedsHUD)
      );
    } catch { }
  }, [showNeedsHUD]);

  // Hide dev hint after a few seconds in dev
  useEffect(() => {
    if (!(import.meta.env && import.meta.env.DEV)) return;
    if (!devHintVisible) return;
    const id = setTimeout(() => setDevHintVisible(false), 5000);
    return () => clearTimeout(id);
  }, [devHintVisible]);

  // Cleanup toasts on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
      if (reminderTimeoutRef.current) {
        clearTimeout(reminderTimeoutRef.current);
      }
    };
  }, []);

  // Poll countdown (logic preserved for future UI)
  useEffect(() => {
    if (!activePoll) {
      setPollCountdown(0);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(
        0,
        Math.round((activePoll.expiresAt - Date.now()) / 1000)
      );
      setPollCountdown(remaining);
    };

    updateCountdown();
    const id = setInterval(updateCountdown, 1000);
    return () => clearInterval(id);
  }, [activePoll]);

  // Overdue adult training reminder
  useEffect(() => {
    if (!isAdopted) {
      // Don’t nag if there’s no real save file yet
      reminderKeyRef.current = null;
      if (reminderToast) setReminderToast(null);
      return;
    }

    if (isPuppy || adultTrainingDoneToday) {
      reminderKeyRef.current = null;
      if (reminderToast) setReminderToast(null);
      return;
    }

    const key = `${todayIso}-${adultLastCompleted || "none"}`;
    if (reminderKeyRef.current === key) return;
    reminderKeyRef.current = key;

    if (reminderTimeoutRef.current) {
      clearTimeout(reminderTimeoutRef.current);
    }

    setReminderToast(
      "Adult training overdue — run a command to keep streaks alive."
    );
    reminderTimeoutRef.current = setTimeout(
      () => setReminderToast(null),
      6000
    );
  }, [
    isAdopted,
    isPuppy,
    adultTrainingDoneToday,
    todayIso,
    adultLastCompleted,
    reminderToast,
  ]);

  const acknowledge = useCallback((message) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setActionToast(message);
    toastTimeoutRef.current = setTimeout(
      () => setActionToast(null),
      2500
    );
  }, []);

  // ✅ Define handleCareAction BEFORE any hook that uses it
  const handleCareAction = useCallback(
    (action) => {
      if (!dog) return;
      const now = Date.now();

      switch (action) {
        case "feed":
          dispatch(feed({ now }));
          acknowledge("Nom nom nom.");
          break;
        case "play":
          dispatch(
            play({
              now,
              timeOfDay: timeOfDay === "morning" ? "MORNING" : "DAY",
            })
          );
          acknowledge("Zoomies achieved!");
          break;
        // Rest removed: dog sleeps on its own
        case "bathe":
          dispatch(bathe({ now }));
          acknowledge("Scrub-a-dub-dub.");
          break;
        case "potty":
          if ((dog.pottyLevel ?? 0) < 25) {
            acknowledge("Not urgent yet.");
            break;
          }
          dispatch(goPotty({ now }));
          acknowledge("Potty break complete.");
          break;
        case "scoop":
          if ((dog.poopCount ?? 0) <= 0) {
            acknowledge("Yard is already spotless.");
            break;
          }
          dispatch(scoopPoop({ now }));
          acknowledge("Yard cleaned up.");
          break;
        case "train":
          dispatch(
            trainObedience({
              commandId: "sit",
              success: true,
              xp: 8,
              now,
            })
          );
          acknowledge("Practiced SIT command.");
          break;
        default:
          break;
      }
    },
    [dispatch, dog, acknowledge, timeOfDay]
  );

  // Dev-only keyboard shortcuts for quick QA (now AFTER handleCareAction)
  useEffect(() => {
    if (!(import.meta.env && import.meta.env.DEV)) return;

    const handler = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;

      switch (e.code) {
        case "KeyQ":
          setShowSpriteQA((s) => !s);
          setDevHintVisible(false);
          break;
        case "KeyF":
          handleCareAction("feed");
          break;
        case "KeyP":
          handleCareAction("play");
          break;
        case "KeyB":
          handleCareAction("bathe");
          break;
        case "KeyO":
          handleCareAction("potty");
          break;
        case "KeyS":
          handleCareAction("scoop");
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleCareAction]);

  const handlePollResponse = useCallback(
    (accepted) => {
      dispatch(
        respondToDogPoll({
          accepted,
          reason: accepted ? "ACCEPT" : "DECLINE",
          now: Date.now(),
        })
      );
    },
    [dispatch]
  );

  const handleQuickAdopt = useCallback(() => {
    dispatch(setDogName("Buddy"));
    dispatch(setAdoptedAt(Date.now()));
  }, [dispatch]);

  // ---------- Render ----------

  let mainContent;

  if (!hasDog) {
    // Redux not hydrated yet or no dog state created
    mainContent = (
      <div className="flex items-center justify-center min-h-[60vh] bg-zinc-950">
        <div className="space-y-3 text-center max-w-sm px-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Loading your pup…
          </h1>
          <p className="text-xs text-zinc-400">
            If this screen is stuck, use the back button and go through the
            Adopt flow again so Doggerz can create your save file.
          </p>
        </div>
      </div>
    );
  } else if (!isAdopted) {
    // Dog object exists but Adopt flow never set adoptedAt
    mainContent = (
      <div className="flex items-center justify-center min-h-[60vh] bg-zinc-950">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-50 mb-4">
            No Dog Adopted
          </h2>
          <p className="text-zinc-400 mb-6">
            Adopt a dog to get started with the main game.
          </p>
          <button
            onClick={handleQuickAdopt}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-full transition"
          >
            Quick Adopt (Test)
          </button>
        </div>
      </div>
    );
  } else {
    // Full game layout
    mainContent = (
      <section className="grid gap-6 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        {/* Left: yard & sprite */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900">
          {/* Background yard (gradient) + overlay */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-70"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 0%, rgba(34,197,94,0.28) 0, transparent 55%), " +
                "radial-gradient(circle at 80% 100%, rgba(14,165,233,0.28) 0, transparent 55%), " +
                "linear-gradient(180deg, #020617 0%, #020617 100%)",
            }}
          />
          <div
            className="absolute inset-0 mix-blend-multiply"
            style={overlayStyle}
          />

          {/* Dog sprite */}
          <div className="relative z-10 flex flex-col items-center justify-center h-64">
            <EnhancedDogSprite
              animation={spriteAnim}
              showCleanlinessOverlay={showOverlay}
              reducedMotion={reducedMotion}
            />
            {import.meta.env && import.meta.env.DEV && devHintVisible && (
              <div className="mt-2 text-[0.7rem] text-zinc-400">
                Press{" "}
                <span className="text-emerald-400">
                  Q
                </span>{" "}
                to toggle Sprite QA
              </div>
            )}
          </div>

          {/* Sprite QA controls */}
          {showSpriteQA && (
            <div className="relative z-10 px-4 pb-2">
              <div className="inline-flex items-center gap-2 text-[0.7rem] text-zinc-300 bg-zinc-900/70 border border-zinc-800 rounded-full px-3 py-1">
                <span className="text-zinc-500">Sprite QA:</span>
                {[
                  { id: "idle", label: "Idle" },
                  { id: "idle_bark", label: "Bark" },
                  { id: "idle_scratch", label: "Scratch" },
                  { id: "attention", label: "Attention" },
                  { id: "sleep", label: "Sleep" },
                ].map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSpriteAnim(a.id)}
                    className={`px-2 py-0.5 rounded-full border transition ${spriteAnim === a.id
                        ? "border-emerald-500/70 text-emerald-300"
                        : "border-zinc-700 text-zinc-300 hover:border-zinc-600"
                      }`}
                  >
                    {a.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowSpriteQA(false)}
                  className="ml-1 text-zinc-500 hover:text-zinc-300"
                  title="Hide QA bar"
                >
                  ✕
                </button>
                <span className="mx-2 text-zinc-600">·</span>
                <label className="inline-flex items-center gap-1 text-zinc-400">
                  <input
                    type="checkbox"
                    className="accent-emerald-500"
                    checked={showOverlay}
                    onChange={(e) => setShowOverlay(e.target.checked)}
                  />
                  Overlay
                </label>
                <span className="mx-1 text-zinc-700">|</span>
                <label className="inline-flex items-center gap-1 text-zinc-400">
                  <input
                    type="checkbox"
                    className="accent-emerald-500"
                    checked={reducedMotion}
                    onChange={(e) => setReducedMotion(e.target.checked)}
                  />
                  Reduced Motion
                </label>
              </div>
            </div>
          )}

          {/* Yard status strip */}
          <div className="relative z-10 flex justify-between items-center px-4 py-2 text-[0.7rem] bg-zinc-950/70 border-t border-zinc-800">
            <span className="text-zinc-400">
              Potty:{" "}
              <span className="text-zinc-100">{pottyStatusLabel}</span>
            </span>
            <span className="text-zinc-400 flex items-center gap-3">
              <span>
                Yard:{" "}
                <span className="text-zinc-100">{yardStatusLabel}</span>
              </span>
              {weather && (
                <span className="inline-flex items-center gap-1 text-zinc-300">
                  <span className="opacity-70">•</span>
                  <span className="uppercase tracking-wide text-[0.65rem] text-emerald-300">
                    {weather.tempF != null ? `${weather.tempF}°F` : "--"}
                  </span>
                  <span className="text-zinc-400 capitalize">
                    {weather.description}
                  </span>
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Right: stats + actions */}
        <div className="space-y-4">
          {/* Cleanliness summary */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-1">
            <p className="text-xs text-zinc-400">
              Cleanliness:{" "}
              <span className="font-semibold text-zinc-100">
                {cleanlinessLabel}
              </span>
            </p>
            <p className="text-[0.7rem] text-zinc-500">
              {cleanlinessSummary}
            </p>
          </div>

          {/* Stat bars */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <StatBar label="Hunger" value={hunger} color="amber" inverse />
              <StatBar
                label="Happiness"
                value={happiness}
                color="emerald"
              />
              <StatBar label="Energy" value={energy} color="blue" />
              <StatBar
                label="Cleanliness"
                value={cleanliness}
                color="cyan"
              />
            </div>
          </div>

          {/* Unified care actions */}
          <CareActionsPanel
            onCareAction={handleCareAction}
            pottyLevel={pottyLevel}
            poopCount={poopCount}
            lowEnergy={energy < 20}
          />

          {/* Voice trainer */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <VoiceCommandButton
              className="w-full"
              mode="tap"
              expectedCommand="sit"
              onCommand={({ match, transcript }) => {
                if (match) {
                  dispatch(
                    trainObedience({
                      commandId: "sit",
                      success: true,
                      xp: 10,
                      now: Date.now(),
                    })
                  );
                  acknowledge("Nice SIT! +10 XP");
                } else {
                  acknowledge(`Heard: "${transcript}"`);
                }
              }}
            />
          </div>

          {/* Potty tracker & yard */}
          <PottyTrackerCard
            isPuppy={isPuppy}
            pottyLevel={pottyLevel}
            pottyStatusLabel={pottyStatusLabel}
            pottyTrainingComplete={pottyTrainingComplete}
            pottyProgress={pottyProgress}
            pottySuccess={pottySuccess}
            pottyGoal={pottyGoal}
            cleanlinessLabel={cleanlinessLabel}
            cleanlinessSummary={cleanlinessSummary}
            yardStatusLabel={yardStatusLabel}
          />

          {/* Journal & Progress */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">
              Journal & Progress
            </h3>
            <ProgressBar
              label={`Potty Training ${pottySuccess}/${pottyGoal || 0}`}
              value={Math.round(pottyProgress * 100)}
              color="amber"
            />
            <div className="text-xs text-zinc-400">
              Adult Streak:{" "}
              <span className="text-zinc-100">
                {adultTraining?.streak || 0}
              </span>
              {adultTraining?.misses ? (
                <>
                  , Misses:{" "}
                  <span className="text-zinc-100">
                    {adultTraining.misses}
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {isAdopted && showNeedsHUD && (
          <div className="sticky top-2 z-40 flex items-start justify-end">
            <div className="flex items-center gap-2">
              <SessionTimer />
              <NeedsHUD needs={needs} />
            </div>
          </div>
        )}
        {/* Only show HUD when we have a real adopted dog */}
        {isAdopted && (
          <GameTopBar
            dogName={dogName}
            level={level}
            coins={coins}
            lifeStageLabel={lifeStageLabel}
            lifeStageDay={lifeStageDay}
            timeOfDay={timeOfDay}
            moodLabel={moodLabel}
            needs={needs}
            temperamentRevealReady={temperamentRevealReady}
          />
        )}

        {/* Toasts */}
        {isAdopted && (actionToast || reminderToast) && (
          <div
            className="space-y-2 text-xs text-amber-200"
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {actionToast && (
              <div className="inline-flex rounded-full bg-amber-900/40 border border-amber-500/40 px-3 py-1">
                {actionToast}
              </div>
            )}
            {reminderToast && (
              <div className="inline-flex rounded-full bg-zinc-900/70 border border-zinc-700 px-3 py-1">
                {reminderToast}
              </div>
            )}
          </div>
        )}

        {mainContent}

        {levelUp && (
          <LevelUpCelebration
            level={levelUp}
            onDone={() => setLevelUp(null)}
          />
        )}
      </div>
    </div>
  );
}

function StatBar({ label, value, color, inverse = false }) {
  const colorMap = {
    amber: "bg-amber-500",
    emerald: "bg-emerald-500",
    blue: "bg-blue-500",
    cyan: "bg-cyan-500",
  };

  const barColor = colorMap[color] || "bg-zinc-500";
  const raw = Number.isFinite(value) ? value : 0;
  const displayValue = inverse ? 100 - raw : raw;
  const percentage = Math.max(0, Math.min(100, displayValue));

  return (
    <div>
      <div className="flex justify-between text-xs text-zinc-400 mb-1">
        <span>{label}</span>
        <span>{Math.round(raw)}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
