<<<<<<< HEAD
//src/pages/Game.jsx
import { useMemo, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

import DogAIEngine from "@/components/dog/DogAIEngine.jsx";
import MainGame from "@/components/game/MainGame.jsx";
import GrowthCelebration from "@/components/dog/components/GrowthCelebration.jsx";
import { preloadJackRussellSheets } from "@/components/dog/assets/jrAtlasAssets.js";
import { getDailyRewardState } from "@/features/billing/dailyRewards.js";
import usePreRegistration from "@/hooks/usePreRegistration.js";
import useModal from "@/hooks/useModal.js";
import {
  selectWeatherCondition,
  selectWeatherIntensity,
} from "@/store/weatherSlice.js";
import {
  selectCloudSyncState,
  selectIsAuthResolved,
  selectIsLoggedIn,
  selectUserZip,
} from "@/store/userSlice.js";
import { selectSettings } from "@/store/settingsSlice.js";
import { useDayNight } from "@/hooks/useDayNight.js";
import WeatherFXCanvas from "@/components/environment/WeatherFXCanvas.jsx";
import { useDog } from "@/hooks/useDogState.js";
import { PATHS } from "@/app/routes.js";
import {
  getWeatherAccent,
  getWeatherLabel,
  normalizeWeatherCondition,
} from "@/utils/weather.js";
import {
  getPlayerSegmentationSnapshot,
  trackEnterGame,
  trackPlayerSegmentSnapshot,
  trackSessionDuration,
} from "@/lib/analytics/gameAnalytics.js";
import { startPerfBudgetMonitor } from "@/lib/perf/perfBudget.js";
=======
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import ActionBar from "../components/game/ActionBar.jsx";
import DailyRewardModal from "../components/game/DailyRewardModal.jsx";
import DogTopCard from "../components/game/DogTopCard.jsx";
import PupStats from "../components/game/PupStats.jsx";
import YardStage from "../components/game/YardStage.jsx";
import { clearDog, loadDog, patchDogStats, saveDog } from "../utils/storage.js";
import {
  calculateNextStreak,
  getTodayKey,
  wasRewardClaimedToday,
} from "../utils/timeWeather.js";
>>>>>>> 10f88903 (chore: remove committed backup folders)

function getPoseForAction(actionId) {
  if (actionId === "sleep") {
    return "sleep";
  }

  return "idle";
}

<<<<<<< HEAD
export default function GamePage() {
  const { active: activeModal, openOnce, closeModalById } = useModal();
  const dog = useDog();
  const zip = useSelector(selectUserZip);
  const isAuthResolved = useSelector(selectIsAuthResolved);
  const isLoggedIn = useSelector(selectIsLoggedIn);
  const cloudSync = useSelector(selectCloudSyncState);
  const weather = useSelector(selectWeatherCondition);
  const weatherIntensity = useSelector(selectWeatherIntensity);
  const settings = useSelector(selectSettings);
  const [rewardNow, setRewardNow] = useState(() => Date.now());
  const [adoptionGateReady, setAdoptionGateReady] = useState(false);
  const [perfSample, setPerfSample] = useState(null);
  const [runtimePerfReduced, setRuntimePerfReduced] = useState(false);
  const perfHealthyStreakRef = useRef(0);
  const activeModalId = String(activeModal?.id || "").trim();
  const lifecycleStatus = String(dog?.lifecycleStatus || "NONE").toUpperCase();
  const lifecycleNoticeKey =
    lifecycleStatus === "FAREWELL"
      ? `lifecycleNotice:FAREWELL:${Number(dog?.legacyJourney?.farewellLetterAt || dog?.adoptedAt || 0)}`
      : lifecycleStatus === "RESCUED"
        ? `lifecycleNotice:RESCUED:${Number(dog?.danger?.rescuedAt || dog?.adoptedAt || 0)}`
        : "";
  const dogInteractive = lifecycleStatus === "ACTIVE";
  const {
    isEligible: isFounderBonusEligible,
    loading: founderBonusLoading,
    claimReward: claimFounderBonus,
    rewardAmount: founderBonusAmount,
    claimed: founderBonusClaimed,
  } = usePreRegistration({
    enabled: dogInteractive,
  });

  const perfReduced =
    shouldReduceEffects(settings?.perfMode) || runtimePerfReduced;
  const showBackgroundPhotos = settings?.showBackgroundPhotos !== false;
  const usePreciseDayNightLocation =
    settings?.usePreciseDayNightLocation === true;
  const {
    isNight,
    source: dayNightSource,
    sunriseProgress,
    timeOfDayBucket,
    style: dayNightStyle,
  } = useDayNight({
    zip,
    enableImages: showBackgroundPhotos,
    usePreciseLocation: usePreciseDayNightLocation,
  });
=======
function getConditionFromStats(stats) {
  if (stats.hunger < 35) return "Hungry";
  if (stats.energy < 35) return "Tired";
  if (stats.happiness < 35) return "Lonely";
  if (stats.cleanliness < 35) return "Dirty";
  if (stats.health < 45) return "Unwell";

  return "Good";
}
>>>>>>> 10f88903 (chore: remove committed backup folders)

export default function Game() {
  const navigate = useNavigate();

  const [dog, setDog] = useState(() => loadDog());
  const [pose, setPose] = useState("idle");
  const [showReward, setShowReward] = useState(false);

<<<<<<< HEAD
  const weatherKey = useMemo(
    () => normalizeWeatherCondition(weather),
    [weather]
  );
  const weatherLabel = useMemo(() => getWeatherLabel(weatherKey), [weatherKey]);
  const weatherAccent = useMemo(
    () => getWeatherAccent(weatherKey),
    [weatherKey]
  );
  const gameSessionStartedAtRef = useRef(Date.now());
  const gameSessionLoggedRef = useRef(false);
  const gameSessionMetaRef = useRef({
    hasDog: Boolean(dog?.adoptedAt),
    lifecycleStatus: String(dog?.lifecycleStatus || "NONE").toLowerCase(),
  });

  useEffect(() => {
    gameSessionMetaRef.current = {
      hasDog: Boolean(dog?.adoptedAt),
      lifecycleStatus: String(dog?.lifecycleStatus || "NONE").toLowerCase(),
    };
  }, [dog?.adoptedAt, dog?.lifecycleStatus]);

  useEffect(() => {
    preloadJackRussellSheets().catch(() => {});
  }, []);

  useEffect(() => {
    const shouldShowPerfOverlay = import.meta.env.DEV;
    const stopMonitor = startPerfBudgetMonitor({
      sampleIntervalMs: 60_000,
      onSample: (sample) => {
        if (shouldShowPerfOverlay) setPerfSample(sample);
        if (sample?.overBudget) {
          perfHealthyStreakRef.current = 0;
          setRuntimePerfReduced(true);
          return;
        }
        perfHealthyStreakRef.current += 1;
        if (perfHealthyStreakRef.current >= 3) {
          setRuntimePerfReduced(false);
        }
      },
    });
    return () => {
      stopMonitor();
    };
  }, []);

  useEffect(() => {
    gameSessionStartedAtRef.current = Date.now();
    gameSessionLoggedRef.current = false;

    const sessionMeta = gameSessionMetaRef.current;
    trackEnterGame({
      hasDog: sessionMeta.hasDog,
      lifecycleStatus: sessionMeta.lifecycleStatus,
    });
    const segmentSnapshot = getPlayerSegmentationSnapshot();
    trackPlayerSegmentSnapshot({
      snapshot: segmentSnapshot,
      source: "game_enter",
    });

    const flushSessionDuration = () => {
      if (gameSessionLoggedRef.current) return;
      const durationMs = Math.max(
        0,
        Date.now() - gameSessionStartedAtRef.current
      );
      const durationSeconds = Math.round(durationMs / 1000);

      gameSessionLoggedRef.current = true;
      const latestMeta = gameSessionMetaRef.current;
      trackSessionDuration({
        durationSeconds,
        hasDog: latestMeta.hasDog,
        lifecycleStatus: latestMeta.lifecycleStatus,
        sessionStartedAt: gameSessionStartedAtRef.current,
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushSessionDuration();
      }
    };

    window.addEventListener("pagehide", flushSessionDuration);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushSessionDuration);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      flushSessionDuration();
    };
  }, []);

  useEffect(() => {
    const updateNow = () => setRewardNow(Date.now());
    const interval = setInterval(updateNow, 60 * 1000);
    window.addEventListener("focus", updateNow);
    document.addEventListener("visibilitychange", updateNow);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", updateNow);
      document.removeEventListener("visibilitychange", updateNow);
    };
  }, []);

  useEffect(() => {
    if (dog?.adoptedAt) {
      setAdoptionGateReady(false);
      return undefined;
=======
  const nextStreak = useMemo(() => {
    if (!dog) {
      return 1;
>>>>>>> 10f88903 (chore: remove committed backup folders)
    }

    return calculateNextStreak(dog.lastRewardDate, dog.streak);
  }, [dog]);

  useEffect(() => {
    if (!dog) {
      navigate("/adopt", { replace: true });
      return;
    }

    setShowReward(!wasRewardClaimedToday(dog.lastRewardDate));
  }, [dog, navigate]);

  useEffect(() => {
    if (pose === "idle") {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setPose("idle");
    }, 2400);

    return () => window.clearTimeout(timeout);
  }, [pose]);

  if (!dog) {
    return null;
  }

  function commitDog(nextDog) {
    const savedDog = saveDog(nextDog);
    setDog(savedDog);
  }

  function handleAction(actionId) {
    setPose(getPoseForAction(actionId));

    let nextDog = dog;

    if (actionId === "feed") {
      nextDog = patchDogStats(dog, {
        hunger: 22,
        happiness: 4,
        energy: -3,
      });

      nextDog = {
        ...nextDog,
        condition: getConditionFromStats(nextDog.stats),
      };
    }

    if (actionId === "pet") {
      nextDog = patchDogStats(dog, {
        happiness: 12,
        bond: 6,
        energy: -2,
      });

      nextDog = {
        ...nextDog,
        condition: getConditionFromStats(nextDog.stats),
      };
    }

    if (actionId === "care") {
      nextDog = patchDogStats(dog, {
        cleanliness: 12,
        health: 5,
        happiness: 3,
      });

      nextDog = {
        ...nextDog,
        condition: getConditionFromStats(nextDog.stats),
      };
    }

    if (actionId === "train") {
      const currentProgress = Number(dog.pottyProgress || 0);
      const nextProgress = Math.min(10, currentProgress + 1);
      const pottyComplete = nextProgress >= 10;

      nextDog = patchDogStats(dog, {
        energy: -6,
        happiness: pottyComplete ? 6 : 2,
        bond: 4,
      });

      nextDog = {
        ...nextDog,
        pottyProgress: nextProgress,
        xp: dog.xp + 10,
        condition: pottyComplete ? "Learning" : "Potty Training",
      };
    }

    if (actionId === "sleep") {
      nextDog = patchDogStats(dog, {
        energy: 20,
        health: 3,
        hunger: -5,
      });

      nextDog = {
        ...nextDog,
        condition: "Resting",
      };
    }

    commitDog(nextDog);
  }

  function handleClaimReward() {
    const today = getTodayKey();

    const nextDog = {
      ...dog,
      coins: Number(dog.coins || 0) + 100,
      streak: nextStreak,
      lastRewardDate: today,
    };

    commitDog(nextDog);
    setShowReward(false);
  }

  function handleResetDog() {
    clearDog();
    navigate("/adopt", { replace: true });
  }

  return (
<<<<<<< HEAD
    <div
      className="dz-safe-area relative h-dvh min-h-0 overflow-hidden pb-24 md:pb-0"
      style={{ ...dayNightStyle, "--weather-accent": weatherAccent }}
      data-weather={weatherKey}
    >
      <DogAIEngine enableAudio enableWeather />
      {/* Extra vignette + grain to sell depth behind the UI */}
      {showVignette ? (
        <div className="pointer-events-none absolute inset-0 bg-black/40" />
      ) : null}
      {showGrain ? (
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.6),transparent_55%)]" />
      ) : null}
=======
    <div className="mx-auto grid w-full max-w-6xl gap-4">
      <DogTopCard dog={dog} />
>>>>>>> 10f88903 (chore: remove committed backup folders)

      <section className="doggerz-card rounded-[2rem] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
              Time Local
            </span>

<<<<<<< HEAD
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {shouldRedirectToAdopt ? (
          <Navigate to={PATHS.ADOPT} replace />
        ) : waitingForCloudAdoptionDecision ? (
          <div className="flex min-h-dvh items-center justify-center px-6 text-center text-zinc-100">
            <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-black/45 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.45)] backdrop-blur">
              <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-200/80">
                Checking your pup
              </div>
              <h1 className="mt-2 text-2xl font-black text-emerald-100">
                Loading your adoption status
              </h1>
              <p className="mt-3 text-sm text-zinc-300">
                Doggerz is checking local and cloud save data before dropping
                you into the yard.
              </p>
            </div>
          </div>
        ) : (
          <MainGame scene={scene} dogInteractive={dogInteractive} />
        )}
      </div>
      {import.meta.env.DEV && perfSample ? (
        <div className="pointer-events-none fixed bottom-2 right-2 z-[90] rounded-xl border border-white/20 bg-black/65 px-2.5 py-2 text-[10px] font-semibold text-white/90 backdrop-blur">
          <div className="uppercase tracking-[0.12em] text-emerald-200/90">
            Perf
          </div>
          <div>FPS: {Math.round(Number(perfSample?.fps || 0))}</div>
          <div>
            Long tasks/min:{" "}
            {Math.round(Number(perfSample?.longTasksPerMinute || 0))}
          </div>
          <div>
            Heap:{" "}
            {Number.isFinite(Number(perfSample?.heapUsedMb))
              ? `${Math.round(Number(perfSample.heapUsedMb))}MB`
              : "n/a"}
          </div>
          <div
            className={
              perfSample?.overBudget
                ? "text-amber-200 font-bold"
                : "text-emerald-200"
            }
          >
            {perfSample?.overBudget ? "Over budget" : "Within budget"}
          </div>
          <div className="text-white/70">
            Scene mode: {runtimePerfReduced ? "scaled-down" : "full"}
          </div>
        </div>
      ) : null}
      <GrowthCelebration />
=======
            <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
              Weather Local
            </span>

            <span className="rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-100">
              Cloud Ready · Waiting for first sync
            </span>
          </div>

          <div className="flex gap-2">
            <Link
              to="/"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-black text-white"
            >
              Home
            </Link>

            <button
              type="button"
              onClick={handleResetDog}
              className="rounded-2xl border border-red-300/20 bg-red-500/10 px-4 py-2 text-sm font-black text-red-100"
            >
              Reset
            </button>
          </div>
        </div>

        <YardStage dog={dog} pose={pose} />
      </section>

      <ActionBar onAction={handleAction} />

      <PupStats dog={dog} />

      {showReward && (
        <DailyRewardModal
          streak={nextStreak}
          onClaim={handleClaimReward}
          onClose={() => setShowReward(false)}
        />
      )}
>>>>>>> 10f88903 (chore: remove committed backup folders)
    </div>
  );
}
