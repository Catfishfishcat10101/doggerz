// src/features/game/DogAIEngine.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

/**
 * Headless engine:
 * - Mounts once on the game screen
 * - Dispatches a small, regular "aiTick" with delta time
 * - Your slice can use this to:
 *   - decay needs (hunger, energy, cleanliness, happiness)
 *   - move the dog position (free-will wandering)
 *   - spawn poop, give coins over time, etc.
 */

const TICK_INTERVAL_MS = 1000; // 1s tick – easy on CPU, good enough for sim

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  useEffect(() => {
    let lastNow = performance.now();

    const id = setInterval(() => {
      const now = performance.now();
      const dt = (now - lastNow) / 1000; // seconds since last tick
      lastNow = now;

      // Soft action name – implement this in dogSlice if you want the AI.
      // Example reducer signature:
      // aiTick(state, action) { const { dt } = action.payload; ... }
      dispatch({
        type: "dog/aiTick",
        payload: {
          dt,
          // you can read this in the reducer if needed:
          snapshot: {
            // be careful to treat this as read-only in reducer; it’s just context.
            mood: dog?.mood,
            stats: dog?.stats,
            coins: dog?.coins,
            poopCount: dog?.poopCount,
          },
        },
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(id);
  }, [dispatch, dog?.coins, dog?.mood, dog?.poopCount, dog?.stats]);

  // Nothing to render – pure logic engine.
  return null;
}
