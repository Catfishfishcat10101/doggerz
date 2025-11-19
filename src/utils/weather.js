// src/utils/weather.js
// @ts-nocheck

/**
 * Simple time-of-day bucketing based on local time.
 * Returns: "night" | "morning" | "day" | "evening"
 */
export function getTimeOfDay(dateLike) {
  try {
    const d = dateLike instanceof Date ? dateLike : new Date();
    const hour = d.getHours();

    if (hour < 5) return "night";
    if (hour < 11) return "morning";
    if (hour < 17) return "day";
    if (hour < 21) return "evening";
    return "night";
  } catch (err) {
    console.error("[Doggerz] getTimeOfDay failed:", err);
    return "day";
  }
}

/**
 * Extremely fake “moon” logic, tuned for vibes not astronomy:
 * - More likely to howl late at night.
 * - Slightly rarer by default so it feels special.
 *
 * You can replace this later with a real moon-phase API
 * and keep the interface the same.
 */
export function shouldHowlAtMoon(timeOfDay) {
  const tod = timeOfDay || getTimeOfDay();

  // Base probabilities
  let baseChance = 0.02; // 2%

  if (tod === "night") {
    baseChance = 0.18; // 18% at night
  } else if (tod === "evening") {
    baseChance = 0.08;
  } else if (tod === "morning") {
    baseChance = 0.03;
  }

  // Add a soft “full moon every ~14 days” vibe using the day of month
  try {
    const today = new Date();
    const day = today.getDate(); // 1–31
    const distFromFakeFull = Math.min(
      Math.abs(day - 1),
      Math.abs(day - 15),
      Math.abs(day - 29)
    );

    // Closer to 1 / 15 / 29 → slightly higher chance
    const moonBoost = Math.max(0, 0.12 - distFromFakeFull * 0.01); // up to +12%
    baseChance += moonBoost;
  } catch {
    // ignore, keep baseChance
  }

  // Clamp between 0 and 0.4 so it never goes insane
  baseChance = Math.max(0, Math.min(baseChance, 0.4));

  return Math.random() < baseChance;
}

/**
 * Optional helper if later you want ambient weather state.
 * For now it's just a placeholder for future expansion.
 */
export function getAmbientWeatherHint() {
  const tod = getTimeOfDay();
  switch (tod) {
    case "morning":
      return "Soft morning light, perfect for a walk.";
    case "day":
      return "Bright and lively. Your pup’s ready for action.";
    case "evening":
      return "Golden hour zoomies are online.";
    case "night":
    default:
      return "Quiet night. Ideal for howls and naps.";
  }
}
