//src/pages/Game.jsx
import { useMemo } from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

import DailyRewardModal from "@/components/DailyRewardModal.jsx";
import MainGame from "@/features/game/MainGame.jsx";
import GrowthCelebration from "@/components/dog/GrowthCelebration.jsx";
import { PATHS } from "@/routes.js";
import { getDailyRewardState } from "@/features/game/dailyRewards.js";
import {
  selectWeatherCondition,
  selectWeatherIntensity,
} from "@/redux/weatherSlice.js";
import { selectUserZip } from "@/redux/userSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { useDayNightBackground } from "@/features/game/useDayNightBackground.jsx";
import WeatherFXCanvas from "@/components/environment/WeatherFXCanvas.jsx";
import { useDog } from "@/hooks/useDogState.js";
import {
  getWeatherAccent,
  getWeatherLabel,
  normalizeWeatherCondition,
} from "@/utils/weather.js";

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
  const dog = useDog();
  const zip = useSelector(selectUserZip);
  const weather = useSelector(selectWeatherCondition);
  const weatherIntensity = useSelector(selectWeatherIntensity);
  const settings = useSelector(selectSettings);
  const [showDailyReward, setShowDailyReward] = useState(false);
  const lifecycleStatus = String(dog?.lifecycleStatus || "NONE").toUpperCase();
  const dogInteractive = lifecycleStatus === "ACTIVE";

  const perfReduced = shouldReduceEffects(settings?.perfMode);
  const showBackgroundPhotos = true;
  const {
    isNight,
    timeOfDayBucket,
    style: dayNightStyle,
  } = useDayNightBackground({
    zip,
    enableImages: showBackgroundPhotos,
  });

  const reduceMotion =
    settings?.reduceMotion === "on" ||
    (settings?.reduceMotion !== "off" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const reduceTransparency = settings?.reduceTransparency === true;
  const showWeatherFx = settings?.showWeatherFx !== false && !perfReduced;
  const showVignette = false;
  const showGrain = false;

  const weatherKey = useMemo(
    () => normalizeWeatherCondition(weather),
    [weather]
  );
  const weatherLabel = useMemo(() => getWeatherLabel(weatherKey), [weatherKey]);
  const weatherAccent = useMemo(
    () => getWeatherAccent(weatherKey),
    [weatherKey]
  );

  const scene = useMemo(
    () => ({
      label:
        String(dog?.yard?.environment || "apartment").toLowerCase() ===
        "apartment"
          ? "Apartment"
          : "Backyard",
      timeOfDay: isNight ? "Night" : titleCase(timeOfDayBucket || "Day"),
      weather: weatherLabel,
      weatherKey,
      weatherAccent,
    }),
    [
      dog?.yard?.environment,
      isNight,
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
        now: Date.now(),
      }),
    [dog?.lastRewardClaimedAt, dog?.consecutiveDays]
  );

  useEffect(() => {
    if (!dog?.adoptedAt) return;
    if (dailyRewardState?.canClaim) {
      setShowDailyReward(true);
    }
  }, [dog?.adoptedAt, dailyRewardState?.canClaim]);

  return (
    <div
      className="dz-safe-area relative min-h-dvh overflow-hidden"
      style={{ ...dayNightStyle, "--weather-accent": weatherAccent }}
      data-weather={weatherKey}
    >
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

      <div className="relative z-10">
        <MainGame scene={scene} dogInteractive={dogInteractive} />
      </div>
      {!dogInteractive ? (
        <LifecycleNoticeOverlay lifecycleStatus={lifecycleStatus} dog={dog} />
      ) : null}
      <GrowthCelebration />
      <DailyRewardModal
        open={showDailyReward}
        rewardState={dailyRewardState}
        onClose={() => setShowDailyReward(false)}
      />
    </div>
  );
}

function LifecycleNoticeOverlay({ lifecycleStatus, dog }) {
  const isRescued = lifecycleStatus === "RESCUED";
  const isFarewell = lifecycleStatus === "FAREWELL";
  const lastName =
    dog?.legacyJourney?.previousDogs?.[0]?.name || dog?.name || "your pup";
  const dangerScore = Number(dog?.danger?.score || 0);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-zinc-950/92 p-6 text-zinc-100 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
        <div className="text-xs uppercase tracking-[0.22em] text-zinc-400">
          {isRescued ? "Animal Rescue Center" : "Legacy Milestone"}
        </div>
        <h2 className="mt-2 text-xl font-extrabold text-emerald-200">
          {isRescued
            ? `${lastName} has been taken into protective care`
            : "Farewell letter received"}
        </h2>
        <p className="mt-3 text-sm text-zinc-300">
          {isRescued
            ? `Danger meter reached ${dangerScore}%. Early severe mistreatment triggered intervention.`
            : "Your pup lived a long life. Rainbow Bridge is now available, and a ghost-dog play bow is queued for your next adoption."}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          {isFarewell ? (
            <Link
              to={PATHS.RAINBOW_BRIDGE}
              className="rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-300"
            >
              Open Rainbow Bridge
            </Link>
          ) : null}
          <Link
            to={PATHS.ADOPT}
            className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/10"
          >
            Adopt a new pup
          </Link>
          <Link
            to={PATHS.MEMORIES}
            className="rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-white/10"
          >
            Read letters
          </Link>
        </div>
      </div>
    </div>
  );
}
