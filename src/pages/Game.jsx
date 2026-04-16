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

function titleCase(s) {
  const str = String(s || "").trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function shouldReduceEffects(perfMode) {
  const mode = String(perfMode || "auto").toLowerCase();
  if (mode === "on") return true;
  if (mode === "off") return false;
  if (typeof window === "undefined") return false;
  try {
    if (navigator?.connection?.saveData) return true;
    const mem = Number(navigator?.deviceMemory || 0);
    if (mem && mem <= 4) return true;
    const cores = Number(navigator?.hardwareConcurrency || 0);
    if (cores && cores <= 4) return true;
  } catch {
    // ignore
  }
  return false;
}

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

  const reduceMotion =
    settings?.reduceMotion === "on" ||
    (settings?.reduceMotion !== "off" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const reduceTransparency = settings?.reduceTransparency === true;
  const showWeatherFx = settings?.showWeatherFx !== false && !perfReduced;
  const showVignette = settings?.showSceneVignette !== false && !perfReduced;
  const showGrain =
    settings?.showSceneGrain !== false && !perfReduced && !reduceTransparency;

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
    }

    if (!isLoggedIn) {
      setAdoptionGateReady(true);
      return undefined;
    }

    setAdoptionGateReady(false);
    const timer = window.setTimeout(() => {
      setAdoptionGateReady(true);
    }, 1600);
    return () => window.clearTimeout(timer);
  }, [dog?.adoptedAt, isLoggedIn]);

  const scene = useMemo(
    () => ({
      label:
        String(dog?.yard?.environment || "yard").toLowerCase() === "apartment"
          ? "Apartment"
          : "Backyard",
      timeOfDay: titleCase(timeOfDayBucket || (isNight ? "night" : "day")),
      timeOfDayBucket,
      isNight,
      sunriseProgress,
      dayNightSource,
      weather: weatherLabel,
      weatherKey,
      weatherAccent,
    }),
    [
      dayNightSource,
      dog?.yard?.environment,
      isNight,
      sunriseProgress,
      timeOfDayBucket,
      weatherLabel,
      weatherKey,
      weatherAccent,
    ]
  );

  const dailyRewardState = useMemo(
    () =>
      getDailyRewardState({
        lastRewardClaimedAt: dog?.lastRewardClaimedAt,
        consecutiveDays: dog?.consecutiveDays,
        now: rewardNow,
      }),
    [dog?.lastRewardClaimedAt, dog?.consecutiveDays, rewardNow]
  );

  useEffect(() => {
    if (!dog?.adoptedAt) return;
    if (activeModal) return;
    if (!dailyRewardState?.canClaim) return;
    const todayMs = Number(dailyRewardState?.todayMs || 0);
    openOnce(
      `dailyReward:${todayMs || "unknown"}`,
      "dailyReward",
      { rewardState: dailyRewardState },
      { replace: false }
    );
  }, [activeModal, dailyRewardState, dog?.adoptedAt, openOnce]);

  useEffect(() => {
    if (lifecycleStatus !== "RESCUED" && lifecycleStatus !== "FAREWELL") {
      if (activeModalId === "lifecycleNotice") {
        closeModalById("lifecycleNotice");
      }
      return;
    }
    if (!dog) return;
    openOnce(
      lifecycleNoticeKey,
      "lifecycleNotice",
      {
        lifecycleStatus,
        dog,
      },
      { replace: true }
    );
  }, [
    activeModalId,
    closeModalById,
    dog,
    lifecycleNoticeKey,
    lifecycleStatus,
    openOnce,
  ]);

  useEffect(() => {
    if (!dogInteractive || founderBonusLoading) return;
    if (activeModal) return;
    if (!isFounderBonusEligible || founderBonusClaimed) return;
    openOnce("founderBonus", "founderBonus", {
      rewardAmount: founderBonusAmount,
      onClaim: async () => claimFounderBonus(),
    });
  }, [
    activeModal,
    claimFounderBonus,
    dogInteractive,
    founderBonusAmount,
    founderBonusClaimed,
    founderBonusLoading,
    isFounderBonusEligible,
    openOnce,
  ]);

  const waitingForCloudAdoptionDecision =
    !dog?.adoptedAt &&
    (!isAuthResolved ||
      (isLoggedIn &&
        (!adoptionGateReady ||
          (cloudSync?.status === "syncing" && !cloudSync?.lastSuccessAt))));

  const shouldRedirectToAdopt =
    !dog?.adoptedAt &&
    isAuthResolved &&
    adoptionGateReady &&
    (!isLoggedIn || cloudSync?.status !== "syncing");

  return (
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

      <WeatherFXCanvas
        mode={showWeatherFx ? weatherKey : "none"}
        intensity={weatherIntensity}
        reduceMotion={reduceMotion}
        reduceTransparency={reduceTransparency}
        className="z-0"
      />

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
    </div>
  );
}
