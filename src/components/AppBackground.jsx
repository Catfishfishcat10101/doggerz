// @ts-nocheck
// src/components/AppBackground.jsx

import React from "react";
import PropTypes from "prop-types";
import { useTimeWeatherBackground } from "@/hooks/useTimeWeatherBackground.js";

/**
 * AppBackground
 *
 * Wraps the entire app in a time-of-day / weather-aware gradient.
 * Children (AppShell layout, routes, etc.) are rendered on top.
 */
export default function AppBackground({ children, zipCode }) {
  const { timeOfDay, skyState } = useTimeWeatherBackground(zipCode);
  const backgroundClass = getBackgroundClass(timeOfDay, skyState);

  return (
    <div
      className={`${backgroundClass} min-h-screen w-full relative overflow-hidden text-white`}
    >
      {/* Subtle overlay to keep readability consistent */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

AppBackground.propTypes = {
  children: PropTypes.node,
  zipCode: PropTypes.string,
};

function getBackgroundClass(timeOfDay, skyState) {
  const t = String(timeOfDay || "").toLowerCase();

  // Night first
  if (t === "night") {
    return "bg-gradient-to-b from-slate-900 via-slate-950 to-black";
  }

  // Weather overrides
  if (skyState === "rainy") {
    return "bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950";
  }
  if (skyState === "cloudy") {
    return "bg-gradient-to-b from-sky-300 via-sky-400 to-slate-700";
  }

  // Clear daytime
  if (t === "morning") {
    return "bg-gradient-to-b from-emerald-500 via-sky-300 to-emerald-700";
  }
  if (t === "evening") {
    return "bg-gradient-to-b from-orange-500 via-rose-500 to-slate-900";
  }

  // Afternoon clear
  return "bg-gradient-to-b from-emerald-500 via-sky-400 to-emerald-800";
}
