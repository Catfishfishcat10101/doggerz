// src/utils/backgroundLayers.js

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function round(value) {
  return Number(Number(value || 0).toFixed(3));
}

function weatherTone(weather) {
  const key = String(weather || "").toLowerCase();
  return {
    rainy: key.includes("rain") || key.includes("storm"),
    cloudy: key.includes("cloud"),
  };
}

function buildSunsetLayers({
  isNight = false,
  sunriseProgress = 0,
  weather = "clear",
  preview = false,
} = {}) {
  const sunrise = clamp(Number(sunriseProgress || 0), 0, 1);
  const nightStrength = isNight ? 1 - sunrise * 0.82 : 0;
  const weatherState = weatherTone(weather);
  const weatherSoftener =
    (weatherState.rainy ? 0.22 : 0) + (weatherState.cloudy ? 0.12 : 0);
  const warmth = clamp(0.95 - nightStrength * 0.42 - weatherSoftener, 0.32, 1);
  const cinematicOpacity = preview ? 0.92 : 0.78;

  return [
    {
      key: "sunset-haze",
      style: {
        background:
          "radial-gradient(1200px 520px at 50% 22%, rgba(251,191,36,0.36), transparent 55%), radial-gradient(980px 420px at 28% 18%, rgba(244,63,94,0.2), transparent 58%), radial-gradient(980px 430px at 72% 16%, rgba(59,130,246,0.18), transparent 60%)",
        opacity: round(cinematicOpacity * warmth),
        mixBlendMode: "screen",
      },
    },
    {
      key: "sunset-depth",
      style: {
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.08) 0%, rgba(15,23,42,0.28) 42%, rgba(2,6,23,0.68) 100%)",
        opacity: round(0.42 + nightStrength * 0.26),
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

export function resolveBackdropLayers(options = {}) {
  const backdropId = String(options?.backdropId || "").trim().toLowerCase();
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

  return buildFallbackLayers({ preview: isPreview });
}

export default resolveBackdropLayers;
