// src/features/game/DogAIEngine.jsx
// @ts-nocheck

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDog, registerSessionStart } from "@/redux/dogSlice.js";

/**
 * DogAIEngine
 *
 * For now this is a lightweight "brain" component:
 * - Registers a session when a dog exists (so your slice can do catch-up decay / streaks later).
 * - Holds a stubbed tick loop where we’ll plug in tickDog / tickDogPolls once they exist.
 *
 * IMPORTANT:
 * This version does NOT depend on:
 *   - hydrateDog
 *   - tickDog
 *   - tickDogPolls
 *   - DOG_STORAGE_KEY
 *   - Firebase (auth, firebaseReady)
 *   - loadDogFromCloud / saveDogToCloud
 *
 * That keeps it in sync with your current simpler dogSlice.
 */

const TICK_INTERVAL_MS = 60_000; // 60 seconds (placeholder for future tick loop)

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  // 1. Register session once we actually have an adopted dog
  useEffect(() => {
    if (!dog || !dog.adoptedAtMs) return;

    dispatch(registerSessionStart({ now: Date.now() }));
  }, [dispatch, dog?.adoptedAtMs]);

  // 2. Placeholder game loop tick
  useEffect(() => {
    if (!dog || !dog.adoptedAtMs) return;

    const intervalId = setInterval(() => {
      const now = Date.now();

      // When you're ready to add decay + polls, uncomment and
      // add the corresponding reducers in dogSlice:
      //
      // dispatch(tickDog({ now }));
      // dispatch(tickDogPolls({ now }));
    }, TICK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [dispatch, dog?.adoptedAtMs]);

  // Headless "brain" component: never renders UI
  return null;
}
