// src/features/game/EnvironmentScene.jsx

import { useEffect, useMemo, useState } from "react";

const LEAF_LAYOUT = Object.freeze([
  { left: 8, top: 8, size: 8, duration: 13, delay: -2.3, dx: 44, rot: 230 },
  { left: 18, top: 16, size: 10, duration: 12, delay: -8.7, dx: 62, rot: 290 },
  { left: 27, top: 10, size: 7, duration: 10, delay: -3.6, dx: 36, rot: 205 },
  { left: 36, top: 20, size: 9, duration: 14, delay: -11.1, dx: 56, rot: 320 },
  { left: 46, top: 12, size: 8, duration: 11, delay: -1.8, dx: 40, rot: 255 },
  { left: 58, top: 17, size: 11, duration: 15, delay: -6.2, dx: 68, rot: 345 },
  { left: 64, top: 9, size: 7, duration: 9, delay: -4.9, dx: 34, rot: 210 },
  { left: 72, top: 15, size: 9, duration: 12, delay: -9.1, dx: 52, rot: 300 },
  { left: 79, top: 11, size: 10, duration: 13, delay: -7.6, dx: 60, rot: 330 },
  { left: 86, top: 18, size: 8, duration: 11, delay: -5.2, dx: 39, rot: 250 },
  { left: 92, top: 14, size: 7, duration: 9, delay: -2.7, dx: 30, rot: 220 },
  { left: 97, top: 21, size: 9, duration: 12, delay: -10.3, dx: 58, rot: 310 },
]);

const AMBIENT_CONFIG = Object.freeze({
  chill: {
    butterflySpawnChance: 0.05,
    leafDriftSpeed: 0.82,
    owlPerchChance: 0.82,
  },
  active: {
    butterflySpawnChance: 0.25,
    leafDriftSpeed: 1.18,
    owlPerchChance: 0.22,
  },
  balanced: {
    butterflySpawnChance: 0.14,
    leafDriftSpeed: 1,
    owlPerchChance: 0.45,
  },
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function randomBetween(min, max) {
  const a = Number(min) || 0;
  const b = Number(max) || 0;
  return a + Math.random() * (b - a);
}

function resolveSeason(mode) {
  const key = String(mode || "auto").toLowerCase();
  if (["spring", "summer", "fall", "winter"].includes(key)) return key;

  const month = new Date().getMonth();
  if (month === 11 || month <= 1) return "winter";
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  return "fall";
}

function normalizeTimeSegment(value) {
  const key = String(value || "day")
    .trim()
    .toLowerCase();
  if (!key) return "day";
  if (key.includes("midnight") || key.includes("night")) return "night";
  if (key.includes("evening")) return "evening";
  if (key.includes("dusk") || key.includes("sunset")) return "dusk";
  if (key.includes("noon")) return "noon";
  if (key.includes("afternoon")) return "afternoon";
  if (key.includes("morning")) return "morning";
  if (key.includes("dawn") || key.includes("sunrise")) return "dawn";
  return "day";
}

function normalizeWeather(weather) {
  const key = String(weather || "clear").toLowerCase();
  if (key.includes("snow")) return "snow";
  if (key.includes("rain") || key.includes("storm")) return "rain";
  if (key.includes("cloud")) return "cloudy";
  return "clear";
}

function getScenePalette(season, isNight) {
  const table = {
    spring: {
      day: {
        skyTop: "#9dd7ff",
        skyMid: "#4f88ce",
        skyBottom: "#2a4365",
        haze: "rgba(99,179,237,0.24)",
        horizon: "rgba(52,211,153,0.14)",
        groundTop: "#274f34",
        groundBottom: "#1a2f22",
      },
      night: {
        skyTop: "#101a2d",
        skyMid: "#0a1120",
        skyBottom: "#050910",
        haze: "rgba(56,189,248,0.11)",
        horizon: "rgba(45,212,191,0.08)",
        groundTop: "#1a3326",
        groundBottom: "#111d16",
      },
    },
    summer: {
      day: {
        skyTop: "#7cc8ff",
        skyMid: "#3a75c4",
        skyBottom: "#223b61",
        haze: "rgba(125,211,252,0.25)",
        horizon: "rgba(16,185,129,0.16)",
        groundTop: "#2f5b3a",
        groundBottom: "#1d3425",
      },
      night: {
        skyTop: "#0c1730",
        skyMid: "#081024",
        skyBottom: "#040913",
        haze: "rgba(14,165,233,0.12)",
        horizon: "rgba(74,222,128,0.08)",
        groundTop: "#1d3a27",
        groundBottom: "#122317",
      },
    },
    fall: {
      day: {
        skyTop: "#b4cdf3",
        skyMid: "#5e78a8",
        skyBottom: "#3a2f3d",
        haze: "rgba(251,146,60,0.2)",
        horizon: "rgba(245,158,11,0.12)",
        groundTop: "#4a442a",
        groundBottom: "#2c2819",
      },
      night: {
        skyTop: "#161822",
        skyMid: "#10121a",
        skyBottom: "#07080d",
        haze: "rgba(245,158,11,0.1)",
        horizon: "rgba(180,83,9,0.08)",
        groundTop: "#312d1e",
        groundBottom: "#1f1c13",
      },
    },
    winter: {
      day: {
        skyTop: "#d8e6fa",
        skyMid: "#7a9bc4",
        skyBottom: "#37485f",
        haze: "rgba(191,219,254,0.28)",
        horizon: "rgba(148,163,184,0.13)",
        groundTop: "#445262",
        groundBottom: "#2a313c",
      },
      night: {
        skyTop: "#0f1522",
        skyMid: "#0a0f1a",
        skyBottom: "#050912",
        haze: "rgba(148,163,184,0.12)",
        horizon: "rgba(100,116,139,0.08)",
        groundTop: "#2f3845",
        groundBottom: "#20262f",
      },
    },
  };

  return table[season]?.[isNight ? "night" : "day"] || table.spring.day;
}

function getLeafColor(season, isNight) {
  if (season === "fall") {
    return isNight ? "rgba(245,158,11,0.52)" : "rgba(251,146,60,0.72)";
  }
  if (season === "winter") {
    return isNight ? "rgba(148,163,184,0.44)" : "rgba(203,213,225,0.6)";
  }
  return isNight ? "rgba(74,222,128,0.42)" : "rgba(134,239,172,0.65)";
}

function resolveAmbientProfile(mode, { dogSleeping, dogEnergy, timeSegment }) {
  const key = String(mode || "auto").toLowerCase();
  if (key === "chill" || key === "active" || key === "balanced") return key;

  if (dogSleeping || dogEnergy <= 24) return "chill";
  if (
    timeSegment === "night" ||
    timeSegment === "evening" ||
    timeSegment === "dusk"
  ) {
    return "chill";
  }
  if (
    (timeSegment === "noon" || timeSegment === "afternoon") &&
    dogEnergy >= 70
  ) {
    return "active";
  }
  return "balanced";
}

function getButterflyCadence({
  season,
  timeSegment,
  profile,
  dogSleeping,
  dogEnergy,
}) {
  if (dogSleeping || dogEnergy <= 10) {
    return {
      enabled: false,
      minMs: 45_000,
      maxMs: 75_000,
      flightMinMs: 9200,
      flightMaxMs: 11200,
    };
  }

  let minMs = 18_000;
  let maxMs = 30_000;
  if (timeSegment === "noon") {
    minMs = 12_000;
    maxMs = 20_000;
  } else if (timeSegment === "afternoon") {
    minMs = 14_000;
    maxMs = 24_000;
  } else if (timeSegment === "morning") {
    minMs = 16_000;
    maxMs = 28_000;
  } else if (timeSegment === "dawn") {
    minMs = 22_000;
    maxMs = 34_000;
  } else if (timeSegment === "dusk" || timeSegment === "evening") {
    minMs = 26_000;
    maxMs = 42_000;
  }

  const seasonMult =
    season === "spring"
      ? 0.82
      : season === "summer"
        ? 0.93
        : season === "fall"
          ? 1.12
          : 1.36;
  const profileMult =
    profile === "active" ? 0.78 : profile === "chill" ? 1.45 : 1;
  const energyMult =
    dogEnergy < 25 ? 1.85 : dogEnergy < 40 ? 1.45 : dogEnergy > 85 ? 0.88 : 1;

  const totalMult = seasonMult * profileMult * energyMult;
  const outMin = clamp(Math.round(minMs * totalMult), 9000, 90_000);
  const outMax = clamp(Math.round(maxMs * totalMult), outMin + 2500, 120_000);

  const flightBaseMin =
    profile === "active" ? 6800 : profile === "chill" ? 8600 : 7600;
  const flightBaseMax =
    profile === "active" ? 8400 : profile === "chill" ? 10_600 : 9200;

  return {
    enabled: true,
    minMs: outMin,
    maxMs: outMax,
    flightMinMs: flightBaseMin,
    flightMaxMs: flightBaseMax,
  };
}

function getOwlCadence({ season, profile, dogSleeping, dogEnergy }) {
  let minMs = 20_000;
  let maxMs = 36_000;
  let perchMinMs = 7000;
  let perchMaxMs = 13_000;

  const seasonMult =
    season === "winter"
      ? 0.9
      : season === "fall"
        ? 0.96
        : season === "spring"
          ? 1.08
          : 1.12;
  const profileMult =
    profile === "chill" ? 0.86 : profile === "active" ? 1.34 : 1;
  const restMult = dogSleeping || dogEnergy < 30 ? 1.5 : 1;

  minMs = clamp(
    Math.round(minMs * seasonMult * profileMult * restMult),
    10_000,
    120_000
  );
  maxMs = clamp(
    Math.round(maxMs * seasonMult * profileMult * restMult),
    minMs + 4000,
    160_000
  );
  perchMinMs = clamp(
    Math.round(perchMinMs * (profile === "chill" ? 1.1 : 1)),
    5000,
    20_000
  );
  perchMaxMs = clamp(
    Math.round(perchMaxMs * (profile === "chill" ? 1.2 : 1)),
    perchMinMs + 2500,
    30_000
  );

  return { minMs, maxMs, perchMinMs, perchMaxMs };
}

export default function EnvironmentScene({
  season = "auto",
  timeOfDay = "day",
  weather = "clear",
  reduceMotion = false,
  reduceTransparency = false,
  holes = [],
  ambientWildlifeEnabled = true,
  ambientCadence = "auto",
  dogEnergy = 100,
  dogSleeping = false,
  onButterflySpotted = null,
}) {
  const resolvedSeason = resolveSeason(season);
  const timeSegment = normalizeTimeSegment(timeOfDay);
  const isNight = timeSegment === "night" || timeSegment === "evening";
  const weatherKey = normalizeWeather(weather);
  const palette = getScenePalette(resolvedSeason, isNight);
  const energyLevel = clamp(Number(dogEnergy || 0), 0, 100);
  const profile = resolveAmbientProfile(ambientCadence, {
    dogSleeping: Boolean(dogSleeping),
    dogEnergy: energyLevel,
    timeSegment,
  });
  const profileConfig = AMBIENT_CONFIG[profile] || AMBIENT_CONFIG.balanced;

  const cloudOpacity =
    weatherKey === "rain" ? 0.54 : weatherKey === "cloudy" ? 0.66 : 0.36;
  const precipitationOpacity = weatherKey === "rain" ? 0.6 : 0.58;
  const canAnimateAmbient = !reduceMotion && ambientWildlifeEnabled;
  const butterflyCadence = useMemo(
    () =>
      getButterflyCadence({
        season: resolvedSeason,
        timeSegment,
        profile,
        dogSleeping: Boolean(dogSleeping),
        dogEnergy: energyLevel,
      }),
    [resolvedSeason, timeSegment, profile, dogSleeping, energyLevel]
  );
  const owlCadence = useMemo(
    () =>
      getOwlCadence({
        season: resolvedSeason,
        profile,
        dogSleeping: Boolean(dogSleeping),
        dogEnergy: energyLevel,
      }),
    [resolvedSeason, profile, dogSleeping, energyLevel]
  );

  const [butterfly, setButterfly] = useState(null);
  const [owlVisible, setOwlVisible] = useState(false);

  const activeLeaves = useMemo(() => {
    if (resolvedSeason === "winter") return [];
    const baseCount = resolvedSeason === "fall" ? 12 : 7;
    const weatherSpeedMult =
      weatherKey === "rain" ? 1.2 : weatherKey === "snow" ? 0.78 : 1;
    const driftMult = profileConfig.leafDriftSpeed * weatherSpeedMult;
    return LEAF_LAYOUT.slice(0, baseCount).map((leaf) => ({
      ...leaf,
      duration: clamp(
        (leaf.duration + (resolvedSeason === "fall" ? -1.2 : 0.8)) / driftMult,
        6.5,
        20
      ),
      dx: Math.round(
        (leaf.dx + (resolvedSeason === "fall" ? 12 : 0)) * driftMult
      ),
      color: getLeafColor(resolvedSeason, isNight),
      opacity: resolvedSeason === "fall" ? 0.82 : 0.68,
    }));
  }, [isNight, profileConfig.leafDriftSpeed, resolvedSeason, weatherKey]);

  useEffect(() => {
    if (!canAnimateAmbient || isNight || !butterflyCadence.enabled) {
      setButterfly(null);
      return undefined;
    }

    let cancelled = false;
    let triggerId = 0;
    const timers = [];
    const setSafeTimeout = (fn, ms) => {
      const id = window.setTimeout(fn, Math.max(0, Math.round(ms)));
      timers.push(id);
      return id;
    };

    const scheduleNext = () => {
      const waitMs = randomBetween(
        butterflyCadence.minMs,
        butterflyCadence.maxMs
      );
      setSafeTimeout(() => {
        if (cancelled) return;
        if (Math.random() > profileConfig.butterflySpawnChance) {
          scheduleNext();
          return;
        }
        const flightMs = randomBetween(
          butterflyCadence.flightMinMs,
          butterflyCadence.flightMaxMs
        );
        const topPct =
          timeSegment === "noon" || timeSegment === "afternoon"
            ? randomBetween(24, 48)
            : timeSegment === "morning" || timeSegment === "day"
              ? randomBetween(28, 54)
              : randomBetween(34, 58);
        const scale = randomBetween(0.88, 1.15);
        const entryKey = ++triggerId;

        setButterfly({ key: entryKey, flightMs, topPct, scale });

        if (
          typeof onButterflySpotted === "function" &&
          !dogSleeping &&
          energyLevel > 20
        ) {
          setSafeTimeout(() => {
            if (!cancelled) onButterflySpotted();
          }, flightMs * 0.44);
        }

        setSafeTimeout(() => {
          if (!cancelled)
            setButterfly((prev) => (prev?.key === entryKey ? null : prev));
        }, flightMs + 180);

        scheduleNext();
      }, waitMs);
    };

    setSafeTimeout(scheduleNext, 5000);

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [
    butterflyCadence.enabled,
    butterflyCadence.flightMaxMs,
    butterflyCadence.flightMinMs,
    butterflyCadence.maxMs,
    butterflyCadence.minMs,
    canAnimateAmbient,
    dogSleeping,
    energyLevel,
    isNight,
    onButterflySpotted,
    profileConfig.butterflySpawnChance,
    timeSegment,
  ]);

  useEffect(() => {
    if (!canAnimateAmbient || !isNight) {
      setOwlVisible(false);
      return undefined;
    }

    let cancelled = false;
    const timers = [];
    const setSafeTimeout = (fn, ms) => {
      const id = window.setTimeout(fn, Math.max(0, Math.round(ms)));
      timers.push(id);
      return id;
    };

    const schedulePerch = () => {
      const waitMs = randomBetween(owlCadence.minMs, owlCadence.maxMs);
      setSafeTimeout(() => {
        if (cancelled) return;
        if (Math.random() > profileConfig.owlPerchChance) {
          schedulePerch();
          return;
        }
        setOwlVisible(true);

        const perchMs = randomBetween(
          owlCadence.perchMinMs,
          owlCadence.perchMaxMs
        );
        setSafeTimeout(() => {
          if (cancelled) return;
          setOwlVisible(false);
          schedulePerch();
        }, perchMs);
      }, waitMs);
    };

    schedulePerch();

    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [
    canAnimateAmbient,
    isNight,
    owlCadence.maxMs,
    owlCadence.minMs,
    owlCadence.perchMaxMs,
    owlCadence.perchMinMs,
    profileConfig.owlPerchChance,
  ]);

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg, ${palette.skyTop} 0%, ${palette.skyMid} 48%, ${palette.skyBottom} 100%)`,
          opacity: reduceTransparency ? 0.9 : 1,
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 70%, ${palette.haze} 0%, transparent 62%)`,
        }}
      />

      <div
        className="absolute inset-x-0 bottom-[26%] h-[28%]"
        style={{
          background: `linear-gradient(180deg, transparent 0%, ${palette.horizon} 60%, transparent 100%)`,
        }}
      />

      <div
        className="absolute inset-x-[-20%] bottom-[24%] h-[25%]"
        style={{
          background:
            "radial-gradient(circle at 8% 100%, rgba(0,0,0,0.35) 0 24%, transparent 25%), radial-gradient(circle at 22% 100%, rgba(0,0,0,0.38) 0 22%, transparent 23%), radial-gradient(circle at 35% 100%, rgba(0,0,0,0.34) 0 26%, transparent 27%), radial-gradient(circle at 49% 100%, rgba(0,0,0,0.4) 0 24%, transparent 25%), radial-gradient(circle at 63% 100%, rgba(0,0,0,0.36) 0 22%, transparent 23%), radial-gradient(circle at 78% 100%, rgba(0,0,0,0.39) 0 26%, transparent 27%), radial-gradient(circle at 92% 100%, rgba(0,0,0,0.34) 0 24%, transparent 25%)",
          opacity: isNight ? 0.66 : 0.46,
          filter: "blur(2px)",
        }}
      />

      <div className="absolute inset-0" style={{ opacity: cloudOpacity }}>
        <div
          className="absolute left-[-28%] top-[11%] h-20 w-96 rounded-full bg-white/26 blur-[22px]"
          style={{
            animation: reduceMotion
              ? "none"
              : "dgCloudDriftA 70s linear infinite",
          }}
        />
        <div
          className="absolute left-[-34%] top-[20%] h-16 w-80 rounded-full bg-white/20 blur-[20px]"
          style={{
            animation: reduceMotion
              ? "none"
              : "dgCloudDriftB 95s linear infinite",
          }}
        />
        <div
          className="absolute left-[-30%] top-[31%] h-14 w-72 rounded-full bg-white/15 blur-[18px]"
          style={{
            animation: reduceMotion
              ? "none"
              : "dgCloudDriftC 120s linear infinite",
          }}
        />
      </div>

      {canAnimateAmbient && activeLeaves.length ? (
        <div className="absolute inset-0">
          {activeLeaves.map((leaf, idx) => (
            <div
              key={`${idx}-${leaf.left}-${leaf.top}`}
              className="absolute rounded-sm"
              style={{
                left: `${leaf.left}%`,
                top: `${leaf.top}%`,
                width: `${leaf.size}px`,
                height: `${Math.max(3, Math.round(leaf.size * 0.52))}px`,
                opacity: leaf.opacity,
                background: leaf.color,
                filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.22))",
                transformOrigin: "center",
                animation: `dgLeafDrift ${leaf.duration}s linear ${leaf.delay}s infinite`,
                "--dg-leaf-dx": `${leaf.dx}px`,
                "--dg-leaf-rot": `${leaf.rot}deg`,
              }}
            />
          ))}
        </div>
      ) : null}

      {butterfly ? (
        <div
          className="absolute left-[-12%] z-[12]"
          style={{
            top: `${butterfly.topPct}%`,
            animation: `dgButterflyFlight ${Math.round(
              butterfly.flightMs
            )}ms cubic-bezier(0.28,0.09,0.24,1) forwards`,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transform: `scale(${butterfly.scale})`,
              filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.35))",
              animation:
                "dgButterflyFlutter 170ms ease-in-out infinite alternate",
            }}
          >
            <svg
              width="34"
              height="22"
              viewBox="0 0 34 22"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.5 6.8c-2.9-5-9.9-7.8-14.4-6.2 0.1 4.9 2.8 10.7 7.8 11.7 2.7 0.5 5-0.8 6.6-2.5"
                fill="rgba(236, 253, 245, 0.88)"
              />
              <path
                d="M17.5 6.8c2.9-5 9.9-7.8 14.4-6.2-0.1 4.9-2.8 10.7-7.8 11.7-2.7 0.5-5-0.8-6.6-2.5"
                fill="rgba(207, 250, 254, 0.82)"
              />
              <path
                d="M16.5 11.6c-2.7 2.9-7.8 4.7-11.9 3.8 0.9 3.7 4.8 6.7 8.8 6.1 2.3-0.3 3.5-2 4.1-3.4"
                fill="rgba(167, 243, 208, 0.78)"
              />
              <path
                d="M17.5 11.6c2.7 2.9 7.8 4.7 11.9 3.8-0.9 3.7-4.8 6.7-8.8 6.1-2.3-0.3-3.5-2-4.1-3.4"
                fill="rgba(186, 230, 253, 0.76)"
              />
              <rect
                x="16.1"
                y="4.8"
                width="1.8"
                height="12.1"
                rx="0.9"
                fill="rgba(15, 23, 42, 0.88)"
              />
            </svg>
          </div>
        </div>
      ) : null}

      <div className="absolute right-[4%] bottom-[25%] h-[42%] w-[18%] opacity-65">
        <div className="absolute left-[44%] bottom-0 h-[46%] w-[11%] rounded-t-lg bg-black/45" />
        <div className="absolute left-[8%] bottom-[32%] h-[50%] w-[82%] rounded-[50%] bg-black/38" />
        {isNight && owlVisible ? (
          <div
            className="absolute left-[50%] bottom-[60%] h-8 w-7 -translate-x-1/2 rounded-full bg-zinc-800/95"
            style={{
              boxShadow: "0 0 16px rgba(0,0,0,0.35)",
              animation: "dgOwlPerch 2.6s ease-in-out infinite",
            }}
          >
            <div className="absolute left-[4px] top-[8px] h-1.5 w-1.5 rounded-full bg-amber-300" />
            <div className="absolute right-[4px] top-[8px] h-1.5 w-1.5 rounded-full bg-amber-300" />
          </div>
        ) : null}
      </div>

      {isNight ? (
        <div className="absolute inset-0 opacity-55">
          <div className="absolute left-[12%] top-[14%] h-[2px] w-[2px] rounded-full bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          <div className="absolute left-[24%] top-[22%] h-[2px] w-[2px] rounded-full bg-white/80" />
          <div className="absolute left-[42%] top-[13%] h-[2px] w-[2px] rounded-full bg-white/85" />
          <div className="absolute left-[58%] top-[20%] h-[1.5px] w-[1.5px] rounded-full bg-white/75" />
          <div className="absolute left-[71%] top-[12%] h-[2px] w-[2px] rounded-full bg-white/90" />
          <div className="absolute left-[83%] top-[24%] h-[1.5px] w-[1.5px] rounded-full bg-white/80" />
          {!reduceMotion ? (
            <div
              className="absolute top-[16%] left-[-16%] h-[2px] w-24 rotate-[-18deg]"
              style={{
                background:
                  "linear-gradient(90deg, rgba(255,255,255,0), rgba(248,250,252,0.95), rgba(255,255,255,0))",
                animation: "dgShootingStar 22s linear infinite",
              }}
            />
          ) : null}
        </div>
      ) : null}

      {weatherKey === "rain" ? (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: precipitationOpacity }}
        >
          <div
            className="absolute -inset-[18%]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(106deg, rgba(191,219,254,0) 0px, rgba(191,219,254,0) 11px, rgba(191,219,254,0.65) 12px, rgba(191,219,254,0.65) 13px)",
              animation: reduceMotion
                ? "none"
                : "dgRainFall 0.72s linear infinite",
            }}
          />
        </div>
      ) : null}

      {weatherKey === "snow" ? (
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: precipitationOpacity }}
        >
          <div
            className="absolute -inset-[25%]"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(248,250,252,0.95) 0.9px, transparent 1px)",
              backgroundSize: "16px 16px",
              animation: reduceMotion
                ? "none"
                : "dgSnowFall 8s linear infinite",
            }}
          />
        </div>
      ) : null}

      <div
        className="absolute inset-x-0 bottom-0 h-[26%]"
        style={{
          background: `linear-gradient(180deg, ${palette.groundTop} 0%, ${palette.groundBottom} 100%)`,
          borderTop: "1px solid rgba(255,255,255,0.08)",
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-[26%]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 8px 8px, rgba(255,255,255,0.06) 0.8px, transparent 1px)",
          backgroundSize: "18px 18px",
          opacity: 0.18,
        }}
      />

      {Array.isArray(holes)
        ? holes.map((hole) => {
            const radius = Number(hole?.radius || 22);
            const fillPct = clamp(Number(hole?.fillPct || 0), 0, 1);
            const depth = 1 - fillPct;

            return (
              <div
                key={hole.id}
                className="absolute rounded-full border border-black/40"
                style={{
                  left: `${Number(hole?.xPct || 50)}%`,
                  top: `${Number(hole?.yPct || 74)}%`,
                  width: `${radius * 2}px`,
                  height: `${radius * (1 + depth * 0.25)}px`,
                  transform: "translate(-50%, -50%)",
                  background:
                    "radial-gradient(ellipse at center, rgba(15,23,42,0.72), rgba(2,6,23,0.96))",
                  opacity: 0.36 + depth * 0.44,
                  boxShadow: `inset 0 ${Math.round(8 * depth)}px ${Math.round(
                    18 * depth
                  )}px rgba(0,0,0,0.45)`,
                }}
              />
            );
          })
        : null}

      <style>
        {`@keyframes dgCloudDriftA { 0% { transform: translateX(0); } 100% { transform: translateX(165%); } }
@keyframes dgCloudDriftB { 0% { transform: translateX(0); } 100% { transform: translateX(182%); } }
@keyframes dgCloudDriftC { 0% { transform: translateX(0); } 100% { transform: translateX(174%); } }
@keyframes dgRainFall { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-30px,120px,0); } }
@keyframes dgSnowFall { 0% { transform: translate3d(0,0,0); } 100% { transform: translate3d(-18px,124px,0); } }
@keyframes dgShootingStar {
  0%, 84% { transform: translateX(0) rotate(-18deg); opacity: 0; }
  88% { opacity: 0.95; }
  100% { transform: translateX(165vw) rotate(-18deg); opacity: 0; }
}
@keyframes dgLeafDrift {
  0% { transform: translate3d(0, -4vh, 0) rotate(0deg); opacity: 0; }
  12% { opacity: 0.86; }
  100% { transform: translate3d(var(--dg-leaf-dx, 40px), 112vh, 0) rotate(var(--dg-leaf-rot, 240deg)); opacity: 0; }
}
@keyframes dgButterflyFlight {
  0% { transform: translate3d(0, 0, 0) rotate(8deg); }
  24% { transform: translate3d(35vw, -34px, 0) rotate(-7deg); }
  48% { transform: translate3d(62vw, 6px, 0) rotate(4deg); }
  75% { transform: translate3d(88vw, -26px, 0) rotate(-11deg); }
  100% { transform: translate3d(118vw, -10px, 0) rotate(0deg); }
}
@keyframes dgButterflyFlutter {
  0% { transform: scaleX(1); }
  100% { transform: scaleX(0.18); }
}
@keyframes dgOwlPerch {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50% { transform: translateX(-50%) translateY(-2px); }
}`}
      </style>
    </div>
  );
}
