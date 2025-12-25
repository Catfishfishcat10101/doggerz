// src/features/game/useDogLifecycle.jsx
// @ts-nocheck

import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectDog, selectDogTemperament } from "@/redux/dogSlice.js";
import { calculateDogAge } from "@/utils/lifecycle.js";

/**
 * Read-only hook that derives lifecycle info for the current dog:
 * - age in game days
 * - life stage (PUPPY / ADULT / SENIOR)
 * - human-readable stage label
 * - temperament (from the slice)
 */
export function useDogLifecycle() {
  const dog = useSelector(selectDog);
  const temperament = useSelector(selectDogTemperament);

  // Normalize adoptedAt to a milliseconds timestamp. Accepts:
  // - number (ms since epoch)
  // - Date
  // - ISO string
  const adoptedRaw =
    dog?.adoptedAt ??
    dog?.adopted_at ??
    dog?.adoptedAtMs ??
    dog?.adopted_at_ms ??
    null;

  const adoptedAtMs = useMemo(() => {
    if (!adoptedRaw && adoptedRaw !== 0) return null;
    if (typeof adoptedRaw === "number" && Number.isFinite(adoptedRaw))
      return adoptedRaw;
    if (adoptedRaw instanceof Date) return adoptedRaw.getTime();
    if (typeof adoptedRaw === "string") {
      // Accept numeric strings or ISO dates
      const numeric = Number(adoptedRaw);
      if (!Number.isNaN(numeric)) return numeric;
      const parsed = Date.parse(adoptedRaw);
      if (!Number.isNaN(parsed)) return parsed;
    }
    return null;
  }, [adoptedRaw]);

  const ageInfo = useMemo(() => {
    if (!adoptedAtMs) return null;
    return calculateDogAge(adoptedAtMs);
  }, [adoptedAtMs]);

  const stageId = ageInfo?.stageId || "PUPPY";
  const stageLabel = ageInfo?.stageLabel || "Puppy";
  const ageInGameDays = ageInfo?.ageInGameDays ?? 0;

  const isPuppy = stageId === "PUPPY";
  const isAdult = stageId === "ADULT";
  const isSenior = stageId === "SENIOR";

  return {
    dog,
    temperament,
    ageInfo,
    ageInGameDays,
    stageId,
    stageLabel,
    isPuppy,
    isAdult,
    isSenior,
  };
}

export default useDogLifecycle;
