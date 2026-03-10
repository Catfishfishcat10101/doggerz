//src/pages/Game.jsx
import { useMemo } from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import BottomTabBar from "@/components/layout/BottomTabBar.jsx";
import MainGame from "@/components/game/MainGame.jsx";
import GrowthCelebration from "@/components/dog/GrowthCelebration.jsx";
import { getDailyRewardState } from "@/features/billing/dailyRewards.js";
import usePreRegistration from "@/hooks/usePreRegistration.js";
import useModal from "@/hooks/useModal.js";
import {
  selectWeatherCondition,
  selectWeatherIntensity,
} from "@/redux/weatherSlice.js";
import { selectUserZip } from "@/redux/userSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { useDayNight } from "@/hooks/useDayNight.js";
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
  const modal = useModal();
  const dog = useDog();
  const zip = useSelector(selectUserZip);
  const weather = useSelector(selectWeatherCondition);
  const weatherIntensity = useSelector(selectWeatherIntensity);
  const settings = useSelector(selectSettings);
  const [rewardNow, setRewardNow] = useState(() => Date.now());
  const lifecycleStatus = String(dog?.lifecycleStatus || "NONE").toUpperCase();
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

  const perfReduced = shouldReduceEffects(settings?.perfMode);
  const showBackgroundPhotos = true;
  const {
    isNight,
    timeOfDayBucket,
    style: dayNightStyle,
  } = useDayNight({
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
        now: rewardNow,
      }),
    [dog?.lastRewardClaimedAt, dog?.consecutiveDays, rewardNow]
  );

  useEffect(() => {
    if (!dog?.adoptedAt) return;
    if (modal.active) return;
    if (!dailyRewardState?.canClaim) return;
    const todayMs = Number(dailyRewardState?.todayMs || 0);
    modal.openOnce(
      `dailyReward:${todayMs || "unknown"}`,
      "dailyReward",
      { rewardState: dailyRewardState },
      { replace: false }
    );
  }, [dailyRewardState, dog?.adoptedAt, modal]);

  useEffect(() => {
    if (dogInteractive) {
      modal.closeModalById("lifecycleNotice");
      return;
    }
    if (!dog) return;
    modal.openModal(
      "lifecycleNotice",
      {
        lifecycleStatus,
        dog,
      },
      { replace: true }
    );
  }, [dog, dogInteractive, lifecycleStatus, modal]);

  useEffect(() => {
    if (!dogInteractive || founderBonusLoading) return;
    if (modal.active) return;
    if (!isFounderBonusEligible || founderBonusClaimed) return;
    modal.openOnce("founderBonus", "founderBonus", {
      rewardAmount: founderBonusAmount,
      onClaim: async () => claimFounderBonus(),
    });
  }, [
    claimFounderBonus,
    dogInteractive,
    founderBonusAmount,
    founderBonusClaimed,
    founderBonusLoading,
    isFounderBonusEligible,
    modal,
  ]);

  return (
    <div
      className="dz-safe-area relative min-h-dvh overflow-hidden pb-24 md:pb-0"
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
      <GrowthCelebration />
      <BottomTabBar />
    </div>
  );
}
