/** @format */
// src/pages/Game.jsx

import { useSelector } from "react-redux";

import MainGame from "@/features/game/MainGame.jsx";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";
import { selectUserZip } from "@/redux/userSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";
import { useDayNightBackground } from "@/features/game/useDayNightBackground.jsx";
import WeatherFXCanvas from "@/components/WeatherFXCanvas.jsx";

function titleCase(s) {
  const str = String(s || "").trim();
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function normalizeWeatherLabel(condition) {
  const c = String(condition || "").toLowerCase();
  if (c === "rain") return "Rain";
  if (c === "snow") return "Snow";
  if (c === "cloud") return "Cloudy";
  if (c === "sun") return "Clear";
  return "Clear";
}

export default function GamePage() {
  const zip = useSelector(selectUserZip);
  const weather = useSelector(selectWeatherCondition);
  const settings = useSelector(selectSettings);

  const { style, isNight, timeOfDayBucket } = useDayNightBackground({ zip });

  const reduceMotion =
    settings?.reduceMotion === "on" ||
    (settings?.reduceMotion !== "off" &&
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  const reduceTransparency = settings?.reduceTransparency === true;

  const scene = {
    label: "Backyard",
    timeOfDay: isNight ? "Night" : titleCase(timeOfDayBucket || "Day"),
    weather: normalizeWeatherLabel(weather),
  };

  return (
    <div className="relative min-h-dvh overflow-hidden" style={style}>
      {/* Extra vignette + grain to sell depth behind the UI */}
      <div className="pointer-events-none absolute inset-0 bg-black/40" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.6),transparent_55%)]" />

      <WeatherFXCanvas
        mode={weather}
        reduceMotion={reduceMotion}
        reduceTransparency={reduceTransparency}
        className="z-0"
      />

      <div className="relative z-10">
        <MainGame scene={scene} />
      </div>
    </div>
  );
}
