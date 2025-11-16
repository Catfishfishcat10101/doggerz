// src/features/game/useDogLifecycle.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerSessionStart,
  tickDog,
  selectDogTemperament,
} from "@/redux/dogSlice.js";

/**
 * Hook that:
 * - Registers a session start (streak, mood, decay catch-up).
 * - Runs a periodic tick to decay stats & sample mood.
 * - Exposes whether temperament reveal is ready.
 */
export function useDogLifecycle({ tickSeconds = 120 } = {}) {
  const dispatch = useDispatch();
  const temperament = useSelector(selectDogTemperament);

  useEffect(() => {
    // On mount: register session
    dispatch(
      registerSessionStart({
        now: Date.now(),
      })
    );
  }, [dispatch]);

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(
        tickDog({
          now: Date.now(),
        })
      );
    }, tickSeconds * 1000);

    return () => clearInterval(interval);
  }, [dispatch, tickSeconds]);

  return {
    temperamentRevealReady: temperament?.revealReady ?? false,
    temperament,
  };
}
