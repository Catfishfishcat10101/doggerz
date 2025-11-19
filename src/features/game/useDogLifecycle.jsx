// src/features/game/useDogLifecycle.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerSessionStart,
  tickDog,
  selectDogTemperament,
  tickDogPolls,
} from "@/redux/dogSlice.js";
import { DEFAULT_TICK_INTERVAL, DOG_POLL_CONFIG } from "@/constants/game.js";

/**
 * Hook that:
 * - Registers a session start (streak, mood, decay catch-up).
 * - Runs a periodic tick to decay stats & sample mood.
 * - Exposes whether temperament reveal is ready.
 * @param {Object} options
 * @param {number} [options.tickSeconds] - Seconds between ticks (default: 120)
 */
export function useDogLifecycle({ tickSeconds = DEFAULT_TICK_INTERVAL } = {}) {
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

  useEffect(() => {
    if (!DOG_POLL_CONFIG?.prompts?.length) return undefined;
    const pollCheckMs = Math.min(
      Math.max((DOG_POLL_CONFIG.intervalMs || 300000) / 6, 15000),
      60000
    );

    const interval = setInterval(() => {
      dispatch(
        tickDogPolls({
          now: Date.now(),
        })
      );
    }, pollCheckMs);

    return () => clearInterval(interval);
  }, [dispatch]);

  return {
    temperamentRevealReady: temperament?.revealReady ?? false,
    temperament,
  };
}
