// src/features/game/utils/weather.js
// Doggerz: Utility for time-of-day, moon, and ambient weather logic.
// Usage: getTimeOfDay(), shouldHowlAtMoon(), getAmbientWeatherHint()
// @ts-nocheck

export function getTimeOfDay(dateLike) {
  try {
    const d =
      dateLike instanceof Date
        ? dateLike
        : typeof dateLike === "number"
          ? new Date(dateLike)
          : new Date();
    const hour = d.getHours();
    if (hour < 5) return "night";
    if (hour < 7) return "dawn";
    if (hour < 11) return "morning";
    if (hour < 16) return "afternoon";
    if (hour < 19) return "dusk";
    if (hour < 22) return "evening";
    return "night";
  } catch (err) {
    console.error("[Doggerz] getTimeOfDay failed:", err);
    return "afternoon";
  }
}

export function shouldHowlAtMoon(timeOfDay) {
  const tod = timeOfDay || getTimeOfDay();
  let baseChance = 0.02;
  if (tod === "night") {
    baseChance = 0.18;
  } else if (tod === "dusk" || tod === "evening") {
    baseChance = 0.08;
  } else if (tod === "dawn") {
    baseChance = 0.05;
  } else if (tod === "morning") {
    baseChance = 0.03;
  }
  try {
    const today = new Date();
    const day = today.getDate();
    const distFromFakeFull = Math.min(
      Math.abs(day - 1),
      Math.abs(day - 15),
      Math.abs(day - 29),
    );
    const moonBoost = Math.max(0, 0.12 - distFromFakeFull * 0.01);
    baseChance += moonBoost;
  } catch {}
  baseChance = Math.max(0, Math.min(baseChance, 0.4));
  return Math.random() < baseChance;
}

export function getAmbientWeatherHint() {
  const tod = getTimeOfDay();
  switch (tod) {
    case "dawn":
      return "Faint light on the horizon. Perfect time for a quiet walk.";
    case "morning":
      return "Soft morning light, ideal for breakfast and a short play session.";
    case "afternoon":
      return "Bright and lively. Your pup’s ready for action.";
    case "dusk":
      return "Golden hour—great for one last walk before dark.";
    case "evening":
      return "Things are winding down. Your pup’s energy starts to fade.";
    case "night":
    default:
      return "Quiet night. Ideal for howls, dreams, and naps.";
  }
}
