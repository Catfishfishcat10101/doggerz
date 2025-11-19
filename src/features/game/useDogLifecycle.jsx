// src/features/game/useDogLifecycle.jsx
// @ts-nocheck

import { useSelector } from "react-redux";
import { selectDogTemperament } from "@/redux/dogSlice.js";

/**
 * Lightweight lifecycle hook:
 * - Reads temperament from Redux
 * - Exposes whether temperament reveal is ready.
 *
 * NOTE:
 * DogAIEngine (src/features/game/DogAIEngine.jsx) is responsible for:
 *   - registerSessionStart
 *   - tickDog
 *   - tickDogPolls
 *   - persistence
 * so we DO NOT duplicate timers or session registration here.
 */
export function useDogLifecycle() {
  const temperament = useSelector(selectDogTemperament);

  return {
    temperamentRevealReady: temperament?.revealReady ?? false,
    temperament,
  };
}
