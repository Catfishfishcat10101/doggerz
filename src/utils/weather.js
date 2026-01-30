// src/utils/weather.js
// @ts-nocheck

/**
 * Time-of-day buckets tuned for vibe, not astronomy.
 *
 * Returns one of:
 *  - "night"
 *  - "dawn"
 *  - "morning"
 *  - "afternoon"
 *  - "dusk"
 *  - "evening"
 */
export function getTimeOfDay(dateLike, opts = {}) {
  try {
    const d =
      dateLike instanceof Date
        ? dateLike
        : typeof dateLike === "number"
          ? new Date(dateLike)
          : new Date();

    const hour = d.getHours(); // 0–23
    const precision = String(opts.precision || "vibe").toLowerCase();
    if (precision === "broad") {
      if (hour < 6) return "night";
      if (hour < 12) return "morning";
      if (hour < 18) return "afternoon";
      return "evening";
    }

    // 00:00–04:59 → deep night
    if (hour < 5) return "night";

    // 05:00–06:59 → dawn
    if (hour < 7) return "dawn";

    // 07:00–10:59 → morning
    if (hour < 11) return "morning";

    // 11:00–15:59 → afternoon
    if (hour < 16) return "afternoon";

    // 16:00–18:59 → dusk / golden hour
    if (hour < 19) return "dusk";

    // 19:00–21:59 → evening
    if (hour < 22) return "evening";

    // 22:00–23:59 → back to night
    return "night";
  } catch (err) {
    console.error("[Doggerz] getTimeOfDay failed:", err);
    // Safe fallback: generic daytime
    return "afternoon";
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
export function shouldHowlAtMoon(timeOfDay, opts = {}) {
  const tod = timeOfDay || getTimeOfDay();

  // Base probabilities
  let baseChance = 0.02; // 2%

  if (tod === "night") {
    baseChance = 0.18; // 18% at night
  } else if (tod === "dusk" || tod === "evening") {
    baseChance = 0.08;
  } else if (tod === "dawn") {
    baseChance = 0.05;
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

  const rng = typeof opts.rng === "function" ? opts.rng : Math.random;
  return rng() < baseChance;
}

/**
 * Optional helper if later you want ambient weather state.
 * For now it's just a placeholder for future expansion.
 */
export function getAmbientWeatherHint(timeOfDay) {
  const tod = timeOfDay || getTimeOfDay();

  switch (tod) {
    case "dawn":
      return "Faint light on the horizon. Perfect time for a quiet walk.";
    case "morning":
      return "Soft morning light, ideal for breakfast and a short play session.";
    case "afternoon":
      return "Bright and lively. Your pup's ready for action.";
    case "dusk":
      return "Golden hour-great for one last walk before dark.";
    case "evening":
      return "Things are winding down. Your pup's energy starts to fade.";
    case "night":
    default:
      return "Quiet night. Ideal for howls, dreams, and naps.";
  }
}

/**
 * Minimal async `getWeather` fallback used by older hooks.
 * For now this returns a safe default — replace with an API call later.
 */
export async function getWeather() {
  return "clear";
}

export function normalizeWeatherCondition(condition) {
  const key = String(condition || "")
    .trim()
    .toLowerCase();
  if (!key) return "clear";
  if (key === "sunny" || key === "sun") return "clear";
  if (key === "overcast" || key === "cloud") return "cloudy";
  if (key === "storm" || key === "thunder") return "rain";
  if (key === "snowy") return "snow";
  return key;
}

export function getWeatherLabel(condition) {
  const key = normalizeWeatherCondition(condition);
  if (key === "rain") return "Rain";
  if (key === "snow") return "Snow";
  if (key === "cloudy") return "Cloudy";
  if (key === "wind") return "Windy";
  if (key === "mist" || key === "fog") return "Fog";
  return "Clear";
}

export function getWeatherAccent(condition) {
  const key = normalizeWeatherCondition(condition);
  switch (key) {
    case "rain":
      return "#60a5fa";
    case "snow":
      return "#f8fafc";
    case "cloudy":
      return "#94a3b8";
    case "wind":
      return "#a7f3d0";
    case "fog":
    case "mist":
      return "#cbd5f5";
    default:
      return "#facc15";
  }
}
