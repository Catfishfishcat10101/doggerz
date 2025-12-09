// src/lib/weatherApi.js
export async function fetchWeatherByZip(zip) {
  // Simple deterministic placeholder: vary by hour
  const hour = new Date().getHours();
  let condition = "clear";
  if (hour >= 12 && hour < 18) condition = "rain";
  if (hour >= 18) condition = "snow";

  return {
    zip,
    condition,
    temperature: 72,
  };
}
