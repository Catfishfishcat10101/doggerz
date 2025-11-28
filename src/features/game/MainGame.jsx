// src/features/game/MainGame.jsx
// @ts-nocheck

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDog,
  selectDogLifeStage,
  selectDogCleanlinessTier,
  selectDogPolls,
  selectDogTraining,
  feed,
  play,
  // rest,       // ⬅ removed
  // wakeUp,     // ⬅ removed
  bathe,
  goPotty,
  scoopPoop,
  trainObedience,
  respondToDogPoll,
  setAdoptedAt,
  setDogName,
} from "@/redux/dogSlice.js";
import EnhancedDogSprite from "@/features/game/EnhancedDogSprite.jsx";
import { getTimeOfDay } from "@/utils/weather.js";
import { CLEANLINESS_TIER_EFFECTS } from "@/constants/game.js";
import { useDogLifecycle } from "@/features/game/useDogLifecycle.jsx";
import GameTopBar from "@/features/game/GameTopBar.jsx";
import useDayNightBackground from "@/features/game/useDayNightBackground.jsx";
import { selectUser } from "@/redux/userSlice.js";
import ErrorBoundary from "@/features/game/ErrorBoundary.jsx";

// Debug helpers: Logs to help identify why MainGame might not render.
// Remove or silence these once the issue is resolved.

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
  const [renderError, setRenderError] = useState(null);

  const dispatch = useDispatch();
  const { temperamentRevealReady } = useDogLifecycle();
  const user = useSelector(selectUser);
  const dog = useSelector(selectDog);
  const lifeStage = useSelector(selectDogLifeStage);
  const userZip = user?.zip || undefined;
  const { style: yardBackgroundStyle } = useDayNightBackground({ zip: userZip });
  const cleanlinessTier = useSelector(selectDogCleanlinessTier);
  const pollState = useSelector(selectDogPolls);
  const training = useSelector(selectDogTraining);

  // Log key state once and whenever it changes to help trace hydration / selector issues
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("MainGame state:", {
      dogPresent: !!dog,
      dog,
      lifeStage,
      cleanlinessTier,
      pollActive: !!pollState?.active,
      training,
    });
  }, [dog, lifeStage, cleanlinessTier, pollState, training]);

  // Suppress only the specific React Router "Future Flag" dev warning.
  // Keep this filter narrow so other console warnings are preserved.
  useEffect(() => {
    const originalWarn = console.warn;
    console.warn = (...args) => {
      try {
        const first = args[0];
        const text =
          typeof first === "string" ? first : JSON.stringify(first || "");
        // match the known future-flag wording and related token
        if (
          text.includes("React Router Future Flag Warning") ||
          text.includes("v7_startTransition") ||
          text.includes("will begin wrapping state updates in `React.startTransition`")
        ) {
          return;
        }
      } catch (e) {
        // if anything goes wrong, fall back to original warn below
      }
      originalWarn.apply(console, args);
    };
    return () => {
      console.warn = originalWarn;
    };
  }, []);

  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [actionToast, setActionToast] = useState(null);
  const [pollCountdown, setPollCountdown] = useState(0);
  const [reminderToast, setReminderToast] = useState(null);

  const toastTimeoutRef = useRef(null);
  const reminderTimeoutRef = useRef(null);
  const reminderKeyRef = useRef(null);

  const activePoll = pollState?.active || null;

  // ---------- Derived state (safe for "no dog" too) ----------

  const dogName = dog?.name || "Pup";
  const level = Number.isFinite(dog?.level) ? dog.level : 1;
  const coins = Number.isFinite(dog?.coins) ? dog.coins : 0;

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

  const hunger = Math.round(dog?.stats?.hunger ?? 0);
  const happiness = Math.round(dog?.stats?.happiness ?? 0);
  const energy = Math.round(dog?.stats?.energy ?? 0);
  const cleanliness = Math.round(dog?.stats?.cleanliness ?? 0);

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

  const cleanlinessDetails =
    CLEANLINESS_TIER_EFFECTS[cleanlinessTier] ||
    CLEANLINESS_TIER_EFFECTS.FRESH ||
    {};
  const cleanlinessLabel =
    cleanlinessDetails.label || cleanlinessTier || "Fresh";
  const cleanlinessSummary =
    cleanlinessDetails.journalSummary ||
    "Freshly pampered and glowing.";

  const overlayStyle = {
    background: TIME_OVERLAY[timeOfDay] || TIME_OVERLAY.afternoon,
  };

  const hasDog = !!dog;
  const isAdopted = !!dog?.adoptedAt;

  // Simple animation selection (auto-switch based on core state)
  const selectedAnimation = (() => {
    if (dog?.isAsleep || energy <= 15) return "sleep";
    if (happiness >= 80 && energy >= 40) return "attention";
    if (hunger >= 80) return "idle_bark";
    return "idle";
  })();

  // ---------- Effects & callbacks (hooks in stable order) ----------

  // Time-of-day ticker
  useEffect(() => {
    const id = setInterval(() => setTimeOfDay(getTimeOfDay()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

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
    toastTimeoutRef.current = setTimeout(() => setActionToast(null), 2500);
  }, []);

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

  try {
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
            <h2 className="text-2xl font-bold text-zinc-50 mb-4">No Dog Adopted</h2>
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
            {/* Background yard image (day/night) + gradient overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-80"
              style={yardBackgroundStyle}
            />
            <div
              className="absolute inset-0 mix-blend-multiply"
              style={overlayStyle}
            />

            {/* Dog sprite */}
            <div className="relative z-10 flex flex-col items-center justify-center h-64">
              <ErrorBoundary>
                <EnhancedDogSprite animation={selectedAnimation} />
              </ErrorBoundary>
            </div>

            {/* Yard status strip */}
            <div className="relative z-10 flex justify-between items-center px-4 py-2 text-[0.7rem] bg-zinc-950/70 border-t border-zinc-800">
              <span className="text-zinc-400">
                Potty: <span className="text-zinc-100">{pottyStatusLabel}</span>
              </span>
              <span className="text-zinc-400">
                Yard: <span className="text-zinc-100">{yardStatusLabel}</span>
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
              <p className="text-[0.7rem] text-zinc-500">{cleanlinessSummary}</p>
            </div>

            {/* Stat bars */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <StatBar label="Hunger" value={hunger} color="amber" inverse />
                <StatBar label="Happiness" value={happiness} color="emerald" />
                <StatBar label="Energy" value={energy} color="blue" />
                <StatBar label="Cleanliness" value={cleanliness} color="cyan" />
              </div>
            </div>

            {/* Basic care actions – NO Rest button */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCareAction("feed")}
                  className="px-4 py-3 bg-amber-600 hover:bg-amber-500 rounded-lg font-semibold transition text-sm"
                >
                  🍖 Feed
                </button>
                <button
                  onClick={() => handleCareAction("play")}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-semibold transition text-sm"
                >
                  🎾 Play
                </button>
                <button
                  onClick={() => handleCareAction("bathe")}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-semibold transition text-sm col-span-2"
                >
                  🛁 Bathe
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <button
                  onClick={() => handleCareAction("potty")}
                  className="px-3 py-2 rounded-lg border border-zinc-700 hover:border-emerald-500/70 hover:bg-zinc-800 text-zinc-200 transition"
                >
                  🚶 Potty Walk
                </button>
                <button
                  onClick={() => handleCareAction("scoop")}
                  className="px-3 py-2 rounded-lg border border-zinc-700 hover:border-amber-500/70 hover:bg-zinc-800 text-zinc-200 transition"
                >
                  🗑️ Scoop Yard
                </button>
              </div>
            </div>
          </div>
        </section>
      );
    }
  } catch (err) {
    // Capture render-time error to help debugging without crashing the app.
    // eslint-disable-next-line no-console
    console.error("MainGame render error:", err);
    setRenderError(err?.message || String(err));
    mainContent = (
      <div className="p-6 bg-red-900/10 rounded-md border border-red-700 text-red-200">
        <strong>MainGame failed to render.</strong>
        <div className="mt-2 text-xs">
          Check the console for the full stack trace. Error: {String(err?.message || err)}
        </div>
      </div>
    );
  }

  // Render final UI
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Only show HUD when we have a real adopted dog */}
        {isAdopted && !renderError && (
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
          <div className="space-y-2 text-xs text-amber-200">
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

        {/* Main content area */}
        {mainContent}
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






































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































































