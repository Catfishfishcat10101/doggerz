// src/features/game/MainGame.jsx
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
  rest,
  wakeUp,
  bathe,
  goPotty,
  scoopPoop,
  trainObedience,
  respondToDogPoll,
} from "@/redux/dogSlice.js";
import EnhancedDogSprite from "@/features/game/EnhancedDogSprite.jsx";
import WeatherWidget from "@/components/WeatherWidget.jsx";
import { getTimeOfDay } from "@/utils/weather.js";
import {
  WEATHER_API_KEY,
  CLEANLINESS_TIER_EFFECTS,
} from "@/constants/game.js";
import yardDay from "@/assets/backgrounds/yard_day.png";
import { useDogLifecycle } from "@/features/game/useDogLifecycle.jsx";
import GameTopBar from "@/features/game/components/GameTopBar.jsx";
import NeedsDashboard from "@/features/game/components/NeedsDashboard.jsx";
import PottyTrackerCard from "@/features/game/components/PottyTrackerCard.jsx";
import CareActionsPanel from "@/features/game/components/CareActionsPanel.jsx";
import AdultTrainingCard from "@/features/game/components/AdultTrainingCard.jsx";
import DogPollCard from "@/features/game/components/DogPollCard.jsx";

const TIME_OVERLAY = {
  dawn: "linear-gradient(180deg, rgba(255,209,143,0.5) 0%, rgba(15,23,42,0.7) 100%)",
  morning: "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(15,23,42,0.5) 100%)",
  afternoon: "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(15,23,42,0.45) 65%, rgba(2,6,23,0.6) 100%)",
  dusk: "linear-gradient(180deg, rgba(255,164,119,0.4) 0%, rgba(2,6,23,0.8) 100%)",
  evening: "linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(2,6,23,0.85) 100%)",
  night: "linear-gradient(180deg, rgba(2,6,23,0.4) 0%, rgba(0,0,0,0.9) 100%)",
};

/**
 * MainGame is the core “in-yard” experience:
 * - Left: animated yard & dog movement
 * - Right: stats + actions (via StatsPanel)
 */
export default function MainGame() {
  const dispatch = useDispatch();
  const { temperamentRevealReady } = useDogLifecycle();
  const dog = useSelector(selectDog);
  const lifeStage = useSelector(selectDogLifeStage);
  const cleanlinessTier = useSelector(selectDogCleanlinessTier);
  const pollState = useSelector(selectDogPolls);
  const training = useSelector(selectDogTraining);
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [actionToast, setActionToast] = useState(null);
  const [pollCountdown, setPollCountdown] = useState(0);
  const [reminderToast, setReminderToast] = useState(null);
  const toastTimeoutRef = useRef(null);
  const reminderTimeoutRef = useRef(null);
  const reminderKeyRef = useRef(null);
  const activePoll = pollState?.active || null;

  useEffect(() => {
    const id = setInterval(() => setTimeOfDay(getTimeOfDay()), 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(
    () => () => {
      toastTimeoutRef.current && clearTimeout(toastTimeoutRef.current);
      reminderTimeoutRef.current && clearTimeout(reminderTimeoutRef.current);
    },
    []
  );

  useEffect(() => {
    if (!activePoll) {
      setPollCountdown(0);
      return () => { };
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
        case "rest":
          if (dog.isAsleep) {
            dispatch(wakeUp());
            acknowledge("Up and at 'em.");
          } else {
            dispatch(rest({ now }));
            acknowledge("Settling in for a nap…");
          }
          break;
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

  // Hard-guard for when Redux isn't hydrated yet
  if (!dog) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-100">
        <div className="space-y-3 text-center max-w-sm px-4">
          <h1 className="text-lg font-semibold tracking-tight">
            Loading your pup…
          </h1>
          <p className="text-xs text-zinc-400">
            If this screen is stuck, use the back button and go through the
            Adopt flow again so Doggerz can create your save file.
          </p>
        </div>
      </main>
    );
  }

  const dogName = dog.name || "Pup";
  const level = Number.isFinite(dog.level) ? dog.level : 1;
  const coins = Number.isFinite(dog.coins) ? dog.coins : 0;
  const lifeStageLabel = lifeStage?.label || lifeStage?.stage || "Puppy";
  const lifeStageDay = lifeStage?.days ?? 0;
  const lifeStageKey = lifeStage?.stage || "PUPPY";
  const isPuppy = lifeStageKey === "PUPPY";
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
  const adultTrainingDoneToday = adultTraining.lastCompletedDate === todayIso;
  const adultTrainingStreak = adultTraining.streak || 0;
  const adultTrainingMisses = adultTraining.misses || 0;

  useEffect(() => {
    if (isPuppy || adultTrainingDoneToday) {
      reminderKeyRef.current = null;
      if (reminderToast) {
        setReminderToast(null);
      }
      return;
    }

    const key = `${todayIso}-${adultTraining.lastCompletedDate || "none"}`;
    if (reminderKeyRef.current === key) return;
    reminderKeyRef.current = key;
    if (reminderTimeoutRef.current) {
      clearTimeout(reminderTimeoutRef.current);
    }
    setReminderToast("Adult training overdue — run a command to keep streaks alive.");
    reminderTimeoutRef.current = setTimeout(() => setReminderToast(null), 6000);
  }, [isPuppy, adultTrainingDoneToday, todayIso, adultTraining.lastCompletedDate]);

  const hunger = Math.round(dog.stats?.hunger ?? 0);
  const happiness = Math.round(dog.stats?.happiness ?? 0);
  const energy = Math.round(dog.stats?.energy ?? 0);
  const cleanliness = Math.round(dog.stats?.cleanliness ?? 0);

  const moodLabel = dog.mood?.label || "Calibrating vibe…";
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
  const cleanlinessLabel = cleanlinessDetails.label || cleanlinessTier || "Fresh";
  const cleanlinessSummary =
    cleanlinessDetails.journalSummary || "Freshly pampered and glowing.";
  const lowEnergy = energy < 15;
  const overlayStyle = {
    background: TIME_OVERLAY[timeOfDay] || TIME_OVERLAY.afternoon,
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-950 via-sky-900 to-slate-950 text-zinc-50">
      <div className="mx-auto max-w-5xl px-4 py-4 lg:py-6 space-y-4">
        {/* ---------- Top Bar / Meta HUD ---------- */}
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

        {/* ---------- Main Layout ---------- */}
        <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)] items-start">
          {/* Yard / Dog / World */}
          <div className="bg-sky-950/40 border border-sky-800/70 rounded-2xl shadow-xl shadow-sky-950/70 overflow-hidden relative">
            {actionToast && (
              <div className="absolute top-4 right-4 z-20 rounded-full bg-black/60 text-xs px-4 py-2 text-white shadow-lg shadow-black/40">
                {actionToast}
              </div>
            )}
            {reminderToast && (
              <div className="absolute top-20 left-4 z-20 rounded-xl bg-emerald-500/80 text-xs px-4 py-2 text-black font-semibold shadow-lg shadow-emerald-900/60">
                {reminderToast}
              </div>
            )}
            <div className="relative h-[420px] w-full">
              <img
                src={yardDay}
                alt="Doggerz backyard"
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0" style={overlayStyle} />
              <div className="absolute top-4 left-4 text-xs text-white space-y-1">
                <p className="text-[0.6rem] uppercase tracking-[0.3em] text-sky-200">
                  Backyard status
                </p>
                <p className="text-sm font-semibold capitalize">{timeOfDay}</p>
                <p className="text-[0.7rem] text-zinc-200">Mood: {moodLabel}</p>
              </div>

              <div className="relative z-10 h-full flex items-end justify-center pb-6">
                <EnhancedDogSprite />
              </div>
            </div>
          </div>

          {/* Right rail: stats + helper copy */}
          <aside className="space-y-4">
            <NeedsDashboard needs={needs} />

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

            <CareActionsPanel
              onCareAction={handleCareAction}
              dogIsAsleep={Boolean(dog?.isAsleep)}
              pottyLevel={pottyLevel}
              poopCount={poopCount}
              lowEnergy={lowEnergy}
            />

            <AdultTrainingCard
              isPuppy={isPuppy}
              adultTrainingDoneToday={adultTrainingDoneToday}
              adultTrainingStreak={adultTrainingStreak}
              adultTrainingMisses={adultTrainingMisses}
            />

            <DogPollCard
              activePoll={activePoll}
              pollCountdown={pollCountdown}
              onPollResponse={handlePollResponse}
            />

            {WEATHER_API_KEY ? (
              <div className="bg-zinc-900/80 border border-zinc-700/80 rounded-2xl p-3 lg:p-4 shadow-lg shadow-black/40">
                <WeatherWidget />
              </div>
            ) : (
              <div className="bg-zinc-900/60 border border-dashed border-zinc-700 rounded-2xl p-3 lg:p-4 text-xs text-zinc-400 space-y-2">
                <p className="font-semibold text-zinc-200 text-sm">
                  Live weather disabled
                </p>
                <p>
                  Add <code>VITE_OPENWEATHER_API_KEY</code> to <code>.env.local</code> and restart
                  Vite to show your local forecast next to the yard. Totally optional.
                </p>
              </div>
            )}

            <div className="bg-zinc-900/70 border border-zinc-700/60 rounded-2xl p-3 lg:p-4 text-xs text-zinc-400 space-y-2">
              <p className="font-semibold text-zinc-200 text-sm">
                How to grind XP & coins
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Keep all four needs (H / Ha / En / Cl) out of the red.</li>
                <li>Use care actions in the stats panel to recover needs.</li>
                <li>
                  The better you maintain your pup, the faster XP and coins
                  accrue in the background.
                </li>
              </ul>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}
