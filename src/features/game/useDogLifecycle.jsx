// src/features/game/useDogLifecycle.jsx

import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

/**
 * Lightweight lifecycle hook:
 * - Reads temperament from Redux (via dog state)
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
  const dog = useSelector(selectDog);
  const temperament = dog?.temperament ?? null;

  const temperamentRevealReady =
    temperament &&
    typeof temperament === "object" &&
    "revealReady" in temperament
      ? Boolean(temperament.revealReady)
      : false;

  return {
    temperamentRevealReady,
    temperament,
  };
}
