import { WEATHER_API_KEY, WEATHER_CACHE_DURATION } from "@/constants/game.js";

const WEATHER_CACHE_KEY = "doggerz_weather_cache";

export async function getWeatherByZip(zipCode, countryCode = "US") {
  // Check cache first
  const cached = getCachedWeather();
  if (cached && cached.zipCode === zipCode) {
    return cached.data;
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${zipCode},${countryCode}&appid=${WEATHER_API_KEY}&units=imperial`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Weather API failed");
    }

    const data = await response.json();
    const weather = {
      condition: data.weather[0].main.toLowerCase(), // "clear", "rain", "snow", etc
      temp: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise * 1000,
      sunset: data.sys.sunset * 1000,
      timestamp: Date.now(),
    };

    // Cache it
    cacheWeather(zipCode, weather);
    return weather;
  } catch (error) {
    console.error("[Weather] Failed to fetch:", error);
    return getDefaultWeather();
  }
}

export function getMoonPhase() {
  const date = new Date();
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 3) {
    month += 12;
  }

  const c = 365.25 * year;
  const e = 30.6 * month;
  let jd = c + e + day - 694039.09;
  jd /= 29.5305882;
  const b = Math.round((jd - Math.floor(jd)) * 8);

  const phases = [
    "new",
    "waxing_crescent",
    "first_quarter",
    "waxing_gibbous",
    "full",
    "waning_gibbous",
    "last_quarter",
    "waning_crescent",
  ];

  return {
    phase: phases[b >= 8 ? 0 : b],
    isFull: b === 4,
    illumination: jd - Math.floor(jd),
  };
}

export function getTimeOfDay() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 7) return "dawn";
  if (hour >= 7 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 19) return "dusk";
  if (hour >= 19 && hour < 22) return "evening";
  return "night";
}

export function shouldHowlAtMoon() {
  const moon = getMoonPhase();
  const time = getTimeOfDay();
  return moon.isFull && time === "night";
}

function getCachedWeather() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;

    const cached = JSON.parse(raw);
    const age = Date.now() - cached.timestamp;

    if (age < WEATHER_CACHE_DURATION) {
      return cached;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function cacheWeather(zipCode, data) {
  try {
    localStorage.setItem(
      WEATHER_CACHE_KEY,
      JSON.stringify({
        zipCode,
        data,
        timestamp: Date.now(),
      })
    );
  } catch (e) {
    // ignore
  }
}

function getDefaultWeather() {
  return {
    condition: "clear",
    temp: 72,
    description: "Pleasant day",
    icon: "01d",
    sunrise: Date.now(),
    sunset: Date.now() + 12 * 60 * 60 * 1000,
    timestamp: Date.now(),
  };
}
