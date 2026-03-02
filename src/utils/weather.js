function normalizeInput(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function normalizeWeatherCondition(raw) {
  const key = normalizeInput(raw);

  if (!key) return "clear";
  if (key.includes("thunder") || key.includes("storm")) return "rain";
  if (key.includes("drizzle") || key.includes("rain")) return "rain";
  if (key.includes("snow") || key.includes("sleet") || key.includes("ice")) {
    return "snow";
  }
  if (
    key.includes("cloud") ||
    key.includes("overcast") ||
    key.includes("fog")
  ) {
    return "clouds";
  }

  return "clear";
}

export function getWeatherLabel(input) {
  const key = normalizeWeatherCondition(input);
  if (key === "rain") return "Rain";
  if (key === "snow") return "Snow";
  if (key === "clouds") return "Cloudy";
  return "Clear";
}

export function getWeatherAccent(input) {
  const key = normalizeWeatherCondition(input);
  const colors = {
    rain: "#60a5fa",
    snow: "#f8fafc",
    clouds: "#94a3b8",
    clear: "#fbbf24",
  };
  return colors[key] || colors.clear;
}

export function getTimeOfDay(dateLike) {
  const date = dateLike instanceof Date ? dateLike : new Date();
  const hour = Number(date.getHours());
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
}
