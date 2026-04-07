// src/utils/backgroundLayers.js

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function getWeatherTone(weather) {
  const key = String(weather || "").toLowerCase();
  return {
    rainy:
      key.includes("rain") || key.includes("storm") || key.includes("drizzle"),
    cloudy:
      key.includes("cloud") ||
      key.includes("overcast") ||
      key.includes("fog") ||
      key.includes("mist"),
  };
}

function buildSunsetLayers({
  isNight = false,
  sunriseProgress = 0,
  weather = "clear",
  preview = false,
} = {}) {
  const sunrise = clamp(sunriseProgress, 0, 1);
  const nightStrength = isNight ? 1 - sunrise * 0.82 : 0;
  const weatherState = getWeatherTone(weather);
  const weatherSoftener =
    (weatherState.rainy ? 0.22 : 0) + (weatherState.cloudy ? 0.12 : 0);
  const warmth = clamp(0.95 - nightStrength * 0.42 - weatherSoftener, 0.32, 1);

  return [
    {
      key: "sunset-haze",
      style: {
        background:
          "radial-gradient(1200px 520px at 50% 22%, rgba(251,191,36,0.36), transparent 55%), radial-gradient(980px 420px at 28% 18%, rgba(244,63,94,0.2), transparent 58%), radial-gradient(980px 430px at 72% 16%, rgba(59,130,246,0.18), transparent 60%)",
        opacity: preview ? 0.92 * warmth : 0.78 * warmth,
        mixBlendMode: "screen",
      },
    },
    {
      key: "sunset-depth",
      style: {
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.28) 42%, rgba(2,6,23,0.68) 100%)",
        opacity: 0.42 + nightStrength * 0.26,
        mixBlendMode: "multiply",
      },
    },
  ];
}

function buildFallbackLayers({ preview = false } = {}) {
  return [
    {
      key: "fallback-haze",
      style: {
        background:
          "radial-gradient(900px 380px at 50% 24%, rgba(16,185,129,0.22), transparent 56%), radial-gradient(820px 360px at 30% 12%, rgba(56,189,248,0.14), transparent 60%)",
        opacity: preview ? 0.85 : 0.72,
      },
    },
    {
      key: "fallback-depth",
      style: {
        background:
          "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.52))",
        opacity: preview ? 0.85 : 0.75,
      },
    },
  ];
}

function buildMeadowMorningLayers({ preview = false } = {}) {
  return [
    {
      key: "meadow-sky",
      style: {
        background:
          "radial-gradient(1200px 520px at 50% 18%, rgba(147,197,253,0.34), transparent 58%), radial-gradient(980px 420px at 34% 20%, rgba(16,185,129,0.24), transparent 60%)",
        opacity: preview ? 0.92 : 0.78,
        mixBlendMode: "screen",
      },
    },
    {
      key: "meadow-ground",
      style: {
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(22,163,74,0.14) 54%, rgba(4,120,87,0.28) 100%)",
        opacity: preview ? 0.9 : 0.75,
      },
    },
  ];
}

function buildMoonlitGardenLayers({ preview = false } = {}) {
  return [
    {
      key: "moonlit-haze",
      style: {
        background:
          "radial-gradient(1000px 460px at 62% 18%, rgba(147,197,253,0.26), transparent 62%), radial-gradient(980px 440px at 38% 20%, rgba(139,92,246,0.22), transparent 64%)",
        opacity: preview ? 0.88 : 0.72,
        mixBlendMode: "screen",
      },
    },
    {
      key: "moonlit-depth",
      style: {
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.44) 48%, rgba(2,6,23,0.7) 100%)",
        opacity: preview ? 0.92 : 0.84,
        mixBlendMode: "multiply",
      },
    },
  ];
}

export function resolveBackdropLayers(options = {}) {
  const backdropId = String(options?.backdropId || "")
    .trim()
    .toLowerCase();
  const environment = String(options?.environment || "yard")
    .trim()
    .toLowerCase();
  const isPreview = options?.preview === true;

  if (!backdropId) return [];
  if (environment !== "yard") return [];

  if (backdropId === "backdrop_sunset") {
    return buildSunsetLayers({
      isNight: Boolean(options?.isNight),
      sunriseProgress: options?.sunriseProgress,
      weather: options?.weather,
      preview: isPreview,
    });
  }

  if (backdropId === "backdrop_meadow_morning") {
    return buildMeadowMorningLayers({ preview: isPreview });
  }

  if (backdropId === "backdrop_moonlit_garden") {
    return buildMoonlitGardenLayers({ preview: isPreview });
  }

  return buildFallbackLayers({ preview: isPreview });
}
