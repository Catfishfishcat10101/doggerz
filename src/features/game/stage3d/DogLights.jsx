function lightingPresetFor(timeOfDayBucket = "day", isNight = false) {
  const bucket = String(timeOfDayBucket || "day").toLowerCase();

  if (isNight || bucket === "night") {
    return {
      keyColor: "#c8dbff",
      keyIntensity: 0.86,
      fillColor: "#7ea7dc",
      fillIntensity: 0.12,
      rimColor: "#d9caff",
      rimIntensity: 0.74,
      ambientColor: "#13294f",
      ambientIntensity: 0.12,
      envPreset: "night",
      groundColor: "#456054",
      skyColor: "#6f89b0",
      skyGlowColor: "#253d64",
      fogColor: "#5a7194",
      fogNear: 5,
      fogFar: 12,
    };
  }

  if (bucket === "dawn" || bucket === "morning") {
    return {
      keyColor: "#ffe0a2",
      keyIntensity: 1.2,
      fillColor: "#d8eeff",
      fillIntensity: 0.44,
      rimColor: "#ffe6b5",
      rimIntensity: 0.36,
      ambientColor: "#d5eeff",
      ambientIntensity: 0.28,
      envPreset: "park",
      groundColor: "#82a96c",
      skyColor: "#c8e4fb",
      skyGlowColor: "#ffecc2",
      fogColor: "#c3ddf3",
      fogNear: 7,
      fogFar: 16,
    };
  }

  if (bucket === "dusk" || bucket === "evening") {
    return {
      keyColor: "#ffd09a",
      keyIntensity: 1.08,
      fillColor: "#c8cff7",
      fillIntensity: 0.28,
      rimColor: "#f4afd2",
      rimIntensity: 0.52,
      ambientColor: "#2d2f75",
      ambientIntensity: 0.2,
      envPreset: "sunset",
      groundColor: "#7a9562",
      skyColor: "#c6c9ec",
      skyGlowColor: "#ffc897",
      fogColor: "#b8b8d8",
      fogNear: 6,
      fogFar: 14,
    };
  }

  return {
    keyColor: "#ffe1ad",
    keyIntensity: 1.14,
    fillColor: "#deefff",
    fillIntensity: 0.48,
    rimColor: "#ffeecc",
    rimIntensity: 0.3,
    ambientColor: "#d8efff",
    ambientIntensity: 0.28,
    envPreset: "park",
    groundColor: "#7ea56a",
    skyColor: "#cde8ff",
    skyGlowColor: "#fff2c9",
    fogColor: "#c4e0f5",
    fogNear: 8,
    fogFar: 18,
  };
}

function withWeatherOverlay(preset, weatherKey = "clear") {
  const key = String(weatherKey || "clear").toLowerCase();
  const rainy =
    key.includes("rain") || key.includes("storm") || key.includes("drizzle");
  const cloudy =
    key.includes("cloud") || key.includes("overcast") || key.includes("mist");
  const foggy =
    key.includes("fog") || key.includes("haze") || key.includes("mist");
  const snowy =
    key.includes("snow") || key.includes("sleet") || key.includes("flurry");

  if (rainy) {
    return {
      ...preset,
      keyIntensity: Math.max(0.6, preset.keyIntensity * 0.72),
      fillIntensity: Math.max(0.08, preset.fillIntensity * 0.75),
      ambientIntensity: Math.max(0.14, preset.ambientIntensity * 1.2),
      groundColor: "#5f7868",
      skyColor: "#8ea2bb",
      skyGlowColor: "#6b7f9b",
      fogColor: "#7f93ab",
      fogNear: 4.2,
      fogFar: 10.5,
      envPreset: preset.isNight ? "night" : "city",
    };
  }

  if (snowy) {
    return {
      ...preset,
      keyIntensity: preset.keyIntensity * 0.92,
      fillIntensity: Math.max(0.22, preset.fillIntensity * 1.25),
      ambientIntensity: Math.max(0.18, preset.ambientIntensity * 1.22),
      groundColor: "#8e99a2",
      skyColor: "#c8d6e6",
      skyGlowColor: "#e6edf7",
      fogColor: "#b9c8d8",
      fogNear: 5,
      fogFar: 12,
      envPreset: "city",
    };
  }

  if (foggy || cloudy) {
    return {
      ...preset,
      keyIntensity: preset.keyIntensity * 0.82,
      fillIntensity: Math.max(0.16, preset.fillIntensity * 0.94),
      rimIntensity: preset.rimIntensity * 0.66,
      ambientIntensity: Math.max(0.16, preset.ambientIntensity * 1.12),
      groundColor: "#748b72",
      skyColor: "#adc0ce",
      skyGlowColor: "#9eb1c0",
      fogColor: "#9caeba",
      fogNear: 5.4,
      fogFar: 11.8,
    };
  }

  return preset;
}

function withDogStateOverlay(preset, scene = null) {
  const moodKey = String(scene?.moodLabel || "content").toLowerCase();
  const careTone = String(scene?.careTone || "steady").toLowerCase();
  const stageKey = String(scene?.stageKey || "PUPPY").toUpperCase();
  const happinessPct = Number(scene?.happinessPct || 0);
  const energyPct = Number(scene?.energyPct || 0);
  const cleanlinessPct = Number(scene?.cleanlinessPct || 0);
  const bondPct = Number(scene?.bondPct || 0);
  const isSleeping = Boolean(scene?.isSleeping);

  let next = { ...preset };

  if (isSleeping) {
    next = {
      ...next,
      keyIntensity: next.keyIntensity * 0.74,
      fillIntensity: Math.max(0.08, next.fillIntensity * 0.72),
      rimIntensity: next.rimIntensity * 0.58,
      ambientIntensity: Math.max(0.16, next.ambientIntensity * 1.1),
      fogNear: Math.max(4.4, next.fogNear - 0.6),
      fogFar: Math.max(10, next.fogFar - 1.6),
      skyGlowColor: next.isNight ? "#32486f" : "#d9c7a2",
    };
  }

  if (
    moodKey.includes("happy") ||
    careTone === "secure" ||
    happinessPct >= 78
  ) {
    next = {
      ...next,
      keyIntensity: next.keyIntensity * 1.05,
      fillIntensity: next.fillIntensity * 1.08,
      ambientIntensity: next.ambientIntensity * 1.08,
      groundColor: bondPct >= 80 ? "#739c69" : next.groundColor,
      skyGlowColor: next.isNight ? "#3c557c" : "#fff0cf",
    };
  }

  if (
    moodKey.includes("sleepy") ||
    moodKey.includes("tired") ||
    energyPct <= 25
  ) {
    next = {
      ...next,
      keyIntensity: next.keyIntensity * 0.86,
      fillIntensity: next.fillIntensity * 0.84,
      ambientIntensity: next.ambientIntensity * 0.96,
      fogNear: Math.max(4.6, next.fogNear - 0.4),
    };
  }

  if (
    careTone === "neglected" ||
    moodKey.includes("uneasy") ||
    moodKey.includes("dirty") ||
    cleanlinessPct <= 25
  ) {
    next = {
      ...next,
      keyIntensity: next.keyIntensity * 0.82,
      fillIntensity: Math.max(0.1, next.fillIntensity * 0.8),
      rimIntensity: next.rimIntensity * 0.72,
      ambientColor: next.isNight ? "#223355" : "#a7b6b8",
      ambientIntensity: next.ambientIntensity * 1.08,
      groundColor: "#6d7d60",
      fogColor: next.isNight ? "#5d6f88" : "#adb7b6",
    };
  }

  if (stageKey === "SENIOR") {
    next = {
      ...next,
      keyIntensity: next.keyIntensity * 0.92,
      rimIntensity: next.rimIntensity * 0.9,
      skyGlowColor: next.isNight ? "#415372" : "#f0dcc1",
      groundColor: next.isNight ? "#64705c" : "#829166",
    };
  }

  if (stageKey === "PUPPY") {
    next = {
      ...next,
      fillIntensity: next.fillIntensity * 1.05,
      skyGlowColor: next.isNight ? "#39517f" : "#fff3d6",
    };
  }

  return next;
}

export default function resolveDogStageLighting(scene = null) {
  const isNight = Boolean(scene?.isNight);
  const timeOfDayBucket = scene?.timeOfDayBucket || "day";
  const sunriseProgress = Number(scene?.sunriseProgress || 0);
  const weatherKey = String(scene?.weatherKey || "clear").toLowerCase();

  const preset = lightingPresetFor(timeOfDayBucket, isNight);
  const weatherResolved = withWeatherOverlay(
    { ...preset, isNight },
    weatherKey
  );
  const resolved = withDogStateOverlay(weatherResolved, scene);

  return {
    isNight,
    timeOfDayBucket,
    sunriseProgress,
    weatherKey,
    ...resolved,
  };
}
