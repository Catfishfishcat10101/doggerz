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

  if (descriptions.some((d) => d.includes("cloud") || d.includes("overcast"))) {
    return "cloud";
  }

  if (mains.some((m) => m === "clear")) {
    const cloudsPct = Number(data?.clouds?.all);
    if (Number.isFinite(cloudsPct) && cloudsPct >= 25) return "cloud";
    return "sun";
  }

  const cloudsPct = Number(data?.clouds?.all);
  if (Number.isFinite(cloudsPct)) return cloudsPct >= 25 ? "cloud" : "sun";

  return "unknown";
}

function normalizeIntensityFromOpenWeather(data) {
  const items = Array.isArray(data?.weather) ? data.weather : [];
  const mains = items
    .map((w) => String(w?.main || "").toLowerCase())
    .filter(Boolean);
  const descriptions = items
    .map((w) => String(w?.description || "").toLowerCase())
    .filter(Boolean);

  if (mains.some((m) => m === "thunderstorm")) return "heavy";
  if (mains.some((m) => m === "drizzle")) return "light";
  if (mains.some((m) => m === "rain")) {
    if (
      descriptions.some((d) => d.includes("heavy") || d.includes("torrential"))
    ) {
      return "heavy";
    }
    if (
      descriptions.some((d) => d.includes("light") || d.includes("drizzle"))
    ) {
      return "light";
    }
    return "medium";
  }
  if (mains.some((m) => m === "snow")) {
    if (descriptions.some((d) => d.includes("heavy"))) return "heavy";
    if (descriptions.some((d) => d.includes("light"))) return "light";
    return "medium";
  }

  return "medium";
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

function normalizeIntensityFromMeteoCode(code) {
  const c = Number(code);
  if (!Number.isFinite(c)) return "medium";
  if ([51, 53, 55, 56, 57].includes(c)) return "light";
  if ([61, 63, 65, 66, 67].includes(c)) return c >= 65 ? "heavy" : "medium";
  if ([80, 81, 82, 95, 96, 99].includes(c))
    return c === 80 ? "medium" : "heavy";
  if ([71, 73, 75, 77, 85, 86].includes(c)) return c >= 75 ? "heavy" : "medium";
  return "medium";
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

export async function fetchWeatherSnapshot({ zip, signal }) {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const effectiveZip =
    String(zip || "").trim() ||
    import.meta.env.VITE_WEATHER_DEFAULT_ZIP ||
    "10001";

  if (!isUsableOpenWeatherKey(apiKey)) {
    try {
      const { lat, lon, name } = await fetchLatLonForZip(effectiveZip, signal);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(
        lat
      )}&longitude=${encodeURIComponent(
        lon
      )}&current=weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`;

      const resp = await fetch(url, { signal });
      if (!resp.ok) throw new Error(`Open-Meteo fetch failed ${resp.status}`);
      const data = await resp.json();
      const code = data?.current?.weather_code;
      const condition = normalizeConditionFromMeteoCode(code);
      const intensity = normalizeIntensityFromMeteoCode(code);
      return {
        condition,
        intensity,
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
        intensity: "medium",
        zip: effectiveZip,
        fetchedAt: Date.now(),
        source: "openmeteo",
        details: null,
        error: err?.message || "Open-Meteo failed",
      };
    }
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(
    effectiveZip
  )},US&appid=${apiKey}`;

  const resp = await fetch(url, { signal });
  if (!resp.ok) {
    throw new Error(`Weather fetch failed ${resp.status}`);
  }
  const data = await resp.json();

  const condition = normalizeConditionFromOpenWeather(data);
  const intensity = normalizeIntensityFromOpenWeather(data);
  const cloudsPct = Number.isFinite(Number(data?.clouds?.all))
    ? Number(data.clouds.all)
    : null;

  const first = Array.isArray(data?.weather) ? data.weather[0] : null;
  return {
    condition,
    intensity,
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
