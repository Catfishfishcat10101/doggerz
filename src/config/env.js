/// <reference types="vite/client" />

// Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBYN6XJEAiw6eVIChByegk9xcGLWIA0C1E",
  authDomain: "dogger-a8021.firebaseapp.com",
  projectId: "dogger-a8021",
  storageBucket: "dogger-a8021.firebasestorage.app",
  messagingSenderId: "1014835520506",
  appId: "1:1014835520506:web:6dc75cbe987d1dc10a3a43",
  measurementId: "G-VM8P3108DN",
};

// Weather API helper
export async function fetchWeatherByZip(zipCode, countryCode = "US") {
  const apiKey =
    (typeof process !== "undefined" &&
      process.env &&
      process.env.VITE_OPENWEATHER_API_KEY) ||
    undefined;
  if (!apiKey) {
    // Dummy fallback if no API key is set
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

// Backwards-compatible exports expected by other modules
export const FIREBASE = firebaseConfig;
export const missingFirebaseKeys = [];
export const isFirebaseConfigured = Boolean(
  FIREBASE && FIREBASE.apiKey && FIREBASE.apiKey.length > 0
);
