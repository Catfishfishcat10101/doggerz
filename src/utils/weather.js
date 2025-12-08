// Consolidated weather helper API
// Exports:
// - fetchWeatherByZip(zipCode, countryCode) -> fetch real weather or return safe stub
// - getTimeOfDay(zipCode?) -> 'day' | 'night' | 'morning' | etc. (simple heuristic)
// - getAmbientWeatherHint(zipCode?) -> short string like 'clear'|'rain'
// - shouldHowlAtMoon() -> boolean heuristic

// fetchWeatherByZip: uses VITE_OPENWEATHER_API_KEY if available, otherwise returns
// a safe dummy value so UI can render without a real API key.
export async function fetchWeatherByZip(zipCode, countryCode = "US") {
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.VITE_OPENWEATHER_API_KEY) || undefined;
  if (!apiKey) {
    // Dummy fallback
    return {
      zip: zipCode,
      country: countryCode,
      tempC: 20,
      tempF: 68,
      condition: "Clear",
      summary: "Clear",
      raw: null,
    };
  }
  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&appid=${apiKey}&units=metric`;
  const res = await fetch(url);
  const data = await res.json();
  return {
    zip: zipCode,
    country: countryCode,
    tempC: data.main.temp,
    tempF: (data.main.temp * 9) / 5 + 32,
    condition: data.weather[0].main,
    summary: data.weather[0].description,
    raw: data,
  };
}

/** Returns a simple time-of-day string: 'day' or 'night' */
export function getTimeOfDay(/* zipCode optional */) {
  try {
    const hour = new Date().getHours();
    return hour >= 6 && hour < 18 ? "day" : "night";
  } catch (e) {
    return "day";
  }
}

/** Returns a short ambient weather hint string for UI (e.g. 'clear', 'rain') */
export function getAmbientWeatherHint(/* zipCode optional */) {
  // Minimal stub: always return 'clear'. Replace with real weather lookup later.
  return "clear";
}

/** Returns whether the dog should howl at the moon (very naive) */
export function shouldHowlAtMoon(/* now, location */) {
  const tod = getTimeOfDay();
  // Simple heuristic: howl at night occasionally
  if (tod !== "night") return false;
  // small chance to howl at night
  return Math.random() < 0.2;
}

export default { fetchWeatherByZip, getTimeOfDay, getAmbientWeatherHint, shouldHowlAtMoon };
