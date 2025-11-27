import React, { useEffect, useState } from "react";
import { getTimeOfDay } from "@/utils/weather.js";

async function fetchWeatherByZip(zip) {
  const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
  if (!key || !zip) return null;
  try {
    // assume US zip by default
    const url = `https://api.openweathermap.org/data/2.5/weather?zip=${encodeURIComponent(zip)},us&appid=${encodeURIComponent(key)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.error("AnimatedBackground: failed to fetch weather", e);
    return null;
  }
}

export default function AnimatedBackground({ zip, useRealTime }) {
  const [timeBucket, setTimeBucket] = useState(getTimeOfDay());
  const [weather, setWeather] = useState("clear");

  useEffect(() => {
    const t = () => setTimeBucket(getTimeOfDay());
    const id = setInterval(t, 30_000); // update every 30s
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let mounted = true;
    const update = async () => {
      if (useRealTime) {
        const data = await fetchWeatherByZip(zip);
        if (!mounted) return;
        if (data && data.weather && data.weather[0]) {
          const main = (data.weather[0].main || "").toLowerCase();
          if (
            main.includes("rain") ||
            main.includes("drizzle") ||
            main.includes("thunder")
          )
            setWeather("rain");
          else if (main.includes("snow")) setWeather("snow");
          else if (main.includes("cloud")) setWeather("clouds");
          else setWeather("clear");
        } else {
          setWeather("clear");
        }
      } else {
        setWeather("clear");
      }
    };
    update();
    return () => {
      mounted = false;
    };
  }, [zip, useRealTime]);

  // Color gradients by time of day
  const gradients = {
    morning: "linear-gradient(180deg,#0f1724 0%,#0b1020 60%,#081025 100%)",
    afternoon: "linear-gradient(180deg,#071028 0%,#07122f 60%,#021025 100%)",
    dusk: "linear-gradient(180deg,#061026 0%,#071226 60%,#031126 100%)",
    evening: "linear-gradient(180deg,#04121a 0%,#041225 60%,#001119 100%)",
    night: "linear-gradient(180deg,#020614 0%,#00101a 60%,#000814 100%)",
    dawn: "linear-gradient(180deg,#08131a 0%,#071226 60%,#031126 100%)",
  };

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background: gradients[timeBucket] || gradients.afternoon,
        transition: "background 800ms ease",
      }}
    >
      {/* Simple overlays */}
      {weather === "rain" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.22,
            backgroundImage: "url('/sprites/rain.png')",
            backgroundSize: "cover",
          }}
        />
      )}
      {weather === "snow" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.18,
            backgroundImage: "url('/sprites/snow.png')",
            backgroundSize: "cover",
          }}
        />
      )}
      {weather === "clouds" && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            opacity: 0.28,
            backgroundImage: "url('/sprites/clouds.png')",
            backgroundSize: "cover",
          }}
        />
      )}
    </div>
  );
}
