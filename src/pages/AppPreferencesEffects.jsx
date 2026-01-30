// src/pages/AppPreferencesEffects.jsx

import * as React from "react";
import { useSelector } from "react-redux";
import { selectSettings } from "../redux/settingsSlice.js";

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getEffectiveTheme(mode) {
  if (mode === "dark" || mode === "light") return mode;
  return getSystemTheme();
}

function getSystemReducedMotion() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function getEffectiveReduceMotion(mode) {
  if (mode === "on") return true;
  if (mode === "off") return false;
  return getSystemReducedMotion();
}

function isCoarsePointer() {
  if (typeof window === "undefined") return false;
  const hasTouchPoints =
    typeof navigator !== "undefined" &&
    Number(navigator.maxTouchPoints || 0) > 0;
  const coarse =
    window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  return Boolean(hasTouchPoints || coarse);
}

export default function AppPreferencesEffects() {
  const settings = useSelector(selectSettings);

  React.useEffect(() => {
    const root = document.documentElement;
    const applyFlag = (key, enabled) => {
      if (enabled) root.dataset[key] = "1";
      else delete root.dataset[key];
    };

    const apply = () => {
      const themeMode = settings?.theme || "system";
      const effectiveTheme = getEffectiveTheme(themeMode);

      root.dataset.theme = effectiveTheme;
      root.classList.toggle("dark", effectiveTheme === "dark");

      const reduceMotionMode = settings?.reduceMotion || "system";
      const reduceMotion = getEffectiveReduceMotion(reduceMotionMode);
      if (reduceMotion) root.dataset.reduceMotion = "1";
      else delete root.dataset.reduceMotion;

      if (settings?.highContrast) root.dataset.contrast = "high";
      else delete root.dataset.contrast;

      if (settings?.reduceTransparency) root.dataset.transparency = "reduced";
      else delete root.dataset.transparency;

      root.dataset.focusRings = settings?.focusRings || "auto";
      root.dataset.perfMode = settings?.perfMode || "auto";
      root.dataset.trainingInputMode = settings?.trainingInputMode || "both";

      const hitTargetsMode = settings?.hitTargets || "auto";
      const effectiveHitTargets =
        hitTargetsMode === "auto" && isCoarsePointer()
          ? "large"
          : hitTargetsMode;
      root.dataset.hitTargets = effectiveHitTargets;

      applyFlag("batterySaver", Boolean(settings?.batterySaver));
      applyFlag("showHints", settings?.showHints !== false);
      applyFlag("showCritters", settings?.showCritters !== false);
      applyFlag("showWeatherFx", settings?.showWeatherFx !== false);
      applyFlag("showBackgroundPhotos", settings?.showBackgroundPhotos !== false);
      applyFlag("showSceneVignette", settings?.showSceneVignette !== false);
      applyFlag("showSceneGrain", settings?.showSceneGrain !== false);
      applyFlag("hapticsEnabled", settings?.hapticsEnabled !== false);
      applyFlag("dailyRemindersEnabled", settings?.dailyRemindersEnabled !== false);

      const fontScale = Number(settings?.fontScale ?? 1);
      if (Number.isFinite(fontScale) && fontScale !== 1) {
        root.style.fontSize = `${Math.round(fontScale * 100)}%`;
      } else {
        root.style.fontSize = "";
      }
    };

    apply();

    // Re-apply when system theme changes (only matters if user picked "system").
    if (!window.matchMedia) return;

    const mqTheme = window.matchMedia("(prefers-color-scheme: dark)");
    const mqMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const onChange = () => apply();

    try {
      mqTheme.addEventListener("change", onChange);
      mqMotion.addEventListener("change", onChange);
      return () => {
        mqTheme.removeEventListener("change", onChange);
        mqMotion.removeEventListener("change", onChange);
      };
    } catch {
      // Safari fallback
      mqTheme.addListener(onChange);
      mqMotion.addListener(onChange);
      return () => {
        mqTheme.removeListener(onChange);
        mqMotion.removeListener(onChange);
      };
    }
  }, [
    settings?.theme,
    settings?.reduceMotion,
    settings?.highContrast,
    settings?.reduceTransparency,
    settings?.focusRings,
    settings?.hitTargets,
    settings?.fontScale,
    settings?.perfMode,
    settings?.batterySaver,
    settings?.showHints,
    settings?.showCritters,
    settings?.showWeatherFx,
    settings?.showBackgroundPhotos,
    settings?.showSceneVignette,
    settings?.showSceneGrain,
    settings?.hapticsEnabled,
    settings?.dailyRemindersEnabled,
    settings?.trainingInputMode,
  ]);

  return null;
}
