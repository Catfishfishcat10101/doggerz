// src/redux/weatherSlice.js
// Lightweight weather state (local, not persisted to cloud yet)
// condition: 'sun' | 'cloud' | 'rain' | 'snow' | 'unknown'

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

function isUsableOpenWeatherKey(key) {
  const k = String(key || "").trim();
  if (!k) return false;
  const upper = k.toUpperCase();
  if (upper === "CHANGE_ME" || upper === "CHANGEME") return false;
  if (upper === "YOUR_API_KEY" || upper === "YOUR_API_KEY_HERE") return false;
  if (upper === "REPLACE_ME" || upper === "REPLACEME") return false;
  if (upper.startsWith("EXAMPLE")) return false;
  return true;
}

function normalizeConditionFromOpenWeather(data) {
  const items = Array.isArray(data?.weather) ? data.weather : [];
  const mains = items
    .map((w) => String(w?.main || "").toLowerCase())
    .filter(Boolean);
  const descriptions = items
    .map((w) => String(w?.description || "").toLowerCase())
    .filter(Boolean);

  if (
    mains.some((m) => m === "thunderstorm" || m === "drizzle" || m === "rain")
  ) {
    return "rain";
  }
  if (mains.some((m) => m === "snow")) return "snow";
  if (mains.some((m) => m === "clouds")) return "cloud";

  // Foggy/hazy/etc behaves more like "cloudy" than "clear".
  if (
    mains.some(
      (m) =>
        m === "mist" ||
        m === "smoke" ||
        m === "haze" ||
        m === "dust" ||
        m === "fog" ||
        m === "sand" ||
        m === "ash" ||
        m === "squall" ||
        m === "tornado"
    )
  ) {
    return "cloud";
  }

  // Many "partly cloudy" situations still come through as main=Clear.
  // Prefer cloudiness/description when available so the UI doesn't feel "wrong".
  if (descriptions.some((d) => d.includes("cloud") || d.includes("overcast"))) {
    return "cloud";
  }

  if (mains.some((m) => m === "clear")) {
    const cloudsPct = Number(data?.clouds?.all);
    if (Number.isFinite(cloudsPct) && cloudsPct >= 25) return "cloud";
    return "sun";
  }

  // Backup heuristic if "main" is missing/unknown.
  const cloudsPct = Number(data?.clouds?.all);
  // If we only have cloudiness %, treat noticeably cloudy skies as "cloud".
  if (Number.isFinite(cloudsPct)) return cloudsPct >= 25 ? "cloud" : "sun";

  return "unknown";
}

function normalizeConditionFromMeteoCode(code) {
  const c = Number(code);
  if (!Number.isFinite(c)) return "unknown";
  if (c === 0) return "sun";
  if ([1, 2, 3, 45, 48].includes(c)) return "cloud";
  if ([71, 73, 75, 77, 85, 86].includes(c)) return "snow";
  if (
    [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(c)
  ) {
    return "rain";
  }
  return "unknown";
}

async function fetchLatLonForZip(zip, signal) {
  const url = `https://api.zippopotam.us/us/${encodeURIComponent(zip)}`;
  const resp = await fetch(url, { signal });
  if (!resp.ok) throw new Error(`ZIP lookup failed ${resp.status}`);
  const data = await resp.json();
  const place = Array.isArray(data?.places) ? data.places[0] : null;
  const lat = Number(place?.latitude);
  const lon = Number(place?.longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    throw new Error("ZIP lookup missing coordinates");
  }
  return {
    lat,
    lon,
    name:
      typeof place?.["place name"] === "string" ? place["place name"] : null,
  };
}

export const fetchWeatherForZip = createAsyncThunk(
  "weather/fetchForZip",
  /**
   * @param {{ zip?: string|null }} arg
   */
  async (arg = {}, thunkApi) => {
    const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
    const effectiveZip =
      String(arg?.zip || "").trim() ||
      import.meta.env.VITE_WEATHER_DEFAULT_ZIP ||
      "10001"; // NYC fallback

    // No OpenWeather key -> use Open-Meteo (no key required).
    if (!isUsableOpenWeatherKey(apiKey)) {
      try {
        const { lat, lon, name } = await fetchLatLonForZip(
          effectiveZip,
          thunkApi.signal
        );
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
          lat
        )}&longitude=${encodeURIComponent(
          lon
        )}&current=weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

        const resp = await fetch(url, { signal: thunkApi.signal });
        if (!resp.ok) throw new Error(`Open-Meteo fetch failed ${resp.status}`);
        const data = await resp.json();
        const code = data?.current?.weather_code;
        const condition = normalizeConditionFromMeteoCode(code);
        return {
          condition,
          zip: effectiveZip,
          fetchedAt: Date.now(),
          source: "openmeteo",
          details: {
            name,
            weatherCode: Number.isFinite(Number(code)) ? Number(code) : null,
          },
        };
      } catch (err) {
        return {
          condition: "unknown",
          zip: effectiveZip,
          fetchedAt: Date.now(),
          source: "openmeteo",
          details: null,
          error: err?.message || "Open-Meteo failed",
        };
      }
    }

    // ZIP-only request to OpenWeather (matches the day/night hook behavior).
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(
      effectiveZip
    )},US&appid=${apiKey}`;

    const resp = await fetch(url, { signal: thunkApi.signal });
    if (!resp.ok) {
      throw new Error(`Weather fetch failed ${resp.status}`);
    }
    const data = await resp.json();

    const condition = normalizeConditionFromOpenWeather(data);
    const cloudsPct = Number.isFinite(Number(data?.clouds?.all))
      ? Number(data.clouds.all)
      : null;

    const first = Array.isArray(data?.weather) ? data.weather[0] : null;
    return {
      condition,
      zip: effectiveZip,
      fetchedAt: Date.now(),
      source: "openweather",
      details: {
        name: typeof data?.name === "string" ? data.name : null,
        weatherMain: first?.main ? String(first.main) : null,
        weatherId: Number.isFinite(Number(first?.id)) ? Number(first.id) : null,
        cloudsPct,
      },
    };
  }
);

const initialState = {
  condition: "unknown",
  status: "idle", // idle | loading | ok | error | disabled
  lastChangedAt: Date.now(),
  lastFetchedAt: null,
  zip: null,
  source: "none", // none | openweather
  details: null,
  error: null,
};

const order = ["sun", "cloud", "rain", "snow"];

const weatherSlice = createSlice({
  name: "weather",
  initialState,
  reducers: {
    setWeather(state, { payload }) {
      const next = String(payload?.condition || "").toLowerCase();
      if (!next) return;
      if (state.condition !== next) {
        state.condition = next;
        state.lastChangedAt = Date.now();
      }
    },
    cycleWeather(state) {
      const idx = order.indexOf(state.condition);
      state.condition = order[(idx + 1) % order.length];
      state.lastChangedAt = Date.now();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWeatherForZip.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWeatherForZip.fulfilled, (state, action) => {
        const nextCondition = String(
          action.payload?.condition || "unknown"
        ).toLowerCase();
        const nextSource = String(
          action.payload?.source || "none"
        ).toLowerCase();
        const fetchedAt = Number(action.payload?.fetchedAt) || Date.now();

        state.lastFetchedAt = fetchedAt;
        state.zip = action.payload?.zip || state.zip;
        state.source = nextSource;
        state.details = action.payload?.details || null;
        state.error = null;
        state.status = nextSource === "none" ? "disabled" : "ok";

        if (state.condition !== nextCondition) {
          state.condition = nextCondition;
          state.lastChangedAt = Date.now();
        }
      })
      .addCase(fetchWeatherForZip.rejected, (state, action) => {
        state.status = "error";
        state.error = action.error?.message || "Weather fetch failed";
      });
  },
});

export const { setWeather, cycleWeather } = weatherSlice.actions;
export const selectWeatherCondition = (s) => s.weather.condition;
export default weatherSlice.reducer;
