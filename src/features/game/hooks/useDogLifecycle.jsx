import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectDog, selectDogTemperament } from "@/redux/dogSlice.js";
import { GAME_DAYS_PER_REAL_DAY } from "@/constants/game.js";

// Hook: useDogLifecycle
// Provides lightweight lifecycle-derived flags for the UI. The full
// engine lives in `DogAIEngine`, but UI components often need simple
// booleans like `temperamentRevealReady`.
export function useDogLifecycle() {
  const dog = useSelector(selectDog);
  const temperament = useSelector(selectDogTemperament);

  const temperamentRevealReady = useMemo(() => {
    if (temperament && temperament.revealReady) return true;
    if (!dog || !dog.adoptedAt) return false;

    try {
      const msPerRealDay = 24 * 60 * 60 * 1000;
      const realDays = (Date.now() - dog.adoptedAt) / msPerRealDay;
      const gameDays = realDays * (GAME_DAYS_PER_REAL_DAY || 4);
      return gameDays >= 3;
    } catch (e) {
      return false;
    }
  }, [dog, temperament]);

  return useMemo(() => ({ temperamentRevealReady }), [temperamentRevealReady]);
}
