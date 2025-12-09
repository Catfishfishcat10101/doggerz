import { useEffect, useState } from "react";
import { getWeather } from "../utils/weather";

export default function useTimeWeatherBackground() {
  const [bg, setBg] = useState("");

  useEffect(() => {
    let mounted = true;
    getWeather().then((w) => {
      if (!mounted) return;
      setBg(w === "rain" ? "bg-rain" : w === "snow" ? "bg-snow" : "bg-clear");
    });
    return () => {
      mounted = false;
    };
  }, []);

  return bg;
}
// src/hooks/useTimeWeatherBackground.js
import { useSelector } from "react-redux";

export function useTimeWeatherBackground() {
  const condition = useSelector((state) => state.weather.condition);

  const hour = new Date().getHours();
  const isNight = hour < 6 || hour >= 19;

  let variant = "day";
  if (isNight) variant = "night";
  if (condition === "rain") variant = "rain";
  if (condition === "snow") variant = "snow";

  return { variant, condition, isNight };
}
