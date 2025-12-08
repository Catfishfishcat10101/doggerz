// src/features/game/DogAIEngine.jsx
// @ts-nocheck

import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/hooks.js";
import { auth, firebaseReady } from "@/firebase.js";
import {
  hydrateDog,
  tickDog,
  registerSessionStart,
  tickDogPolls,
  selectDog,
  DOG_STORAGE_KEY,
  applyWeatherEffects,
} from "@/redux/dogSlice.js";
import { useTimeWeatherBackground } from "@/hooks/useTimeWeatherBackground.js";
import { loadDogFromCloud, saveDogToCloud } from "@/redux/dogThunks.js";

const TICK_INTERVAL_MS = 60_000; // 60 seconds
const CLOUD_SAVE_DEBOUNCE = 3_000; // 3 seconds

export default function DogAIEngine() {
  const dispatch = useAppDispatch();
  const dogState = useSelector(selectDog);
  // Derive a simple weather hint from the time/weather hook when a redux slice is not present
  const { skyState } = useTimeWeatherBackground();
  const weather = skyState === "rainy" ? "rain" : skyState === "snow" ? "snow" : "clear";

  const hasHydratedRef = useRef(false);
  const cloudSaveTimeoutRef = useRef(null);

  // 1. Hydrate on first mount (localStorage → Redux, then optional cloud)
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    // LocalStorage hydrate
    try {
      const localData = localStorage.getItem(DOG_STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        dispatch(hydrateDog(parsed));
        console.log("[Doggerz] Hydrated dog from localStorage");
      }
    } catch (err) {
      console.error("[Doggerz] Failed to parse localStorage dog data", err);
    }

    // Cloud hydrate if logged in at mount time
    if (firebaseReady && auth?.currentUser) {
      const thunkPromise = dispatch(loadDogFromCloud());

      // RTK's unwrap if available; fall back to raw promise
      if (thunkPromise && typeof thunkPromise.unwrap === "function") {
        thunkPromise.unwrap().catch((err) => {
          console.error("[Doggerz] Failed to load dog from cloud", err);
        });
      } else if (thunkPromise?.catch) {
        thunkPromise.catch((err) => {
          console.error("[Doggerz] Failed to load dog from cloud", err);
        });
      }
    }

    // Register session start (catch-up decay, penalties, streak, etc.)
    dispatch(registerSessionStart({ now: Date.now() }));
  }, [dispatch]);

  // 1b. If user logs in *after* mount, pull from cloud once
  useEffect(() => {
    if (!firebaseReady) return;
    if (!auth?.currentUser) return;
    if (!hasHydratedRef.current) return; // let the first effect run first

    const thunkPromise = dispatch(loadDogFromCloud());

    if (thunkPromise && typeof thunkPromise.unwrap === "function") {
      thunkPromise.unwrap().catch((err) => {
        console.error("[Doggerz] Late cloud load failed", err);
      });
    } else if (thunkPromise?.catch) {
      thunkPromise.catch((err) => {
        console.error("[Doggerz] Late cloud load failed", err);
      });
    }

    // Also count this as a fresh session for decay/streaks
    dispatch(registerSessionStart({ now: Date.now() }));
  }, [dispatch, firebaseReady, auth?.currentUser]);

  // 2. Save to localStorage on every dog state change
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return; // no adopted dog yet

    try {
      localStorage.setItem(DOG_STORAGE_KEY, JSON.stringify(dogState));
    } catch (err) {
      console.error("[Doggerz] Failed to save to localStorage", err);
    }
  }, [dogState]);

  // 3. Debounced cloud save whenever dogState changes while logged in
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return;
    if (!firebaseReady || !auth?.currentUser) return;

    // Clear existing timeout if any
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
    }

    // Schedule new debounced save
    cloudSaveTimeoutRef.current = setTimeout(() => {
      dispatch(saveDogToCloud());
    }, CLOUD_SAVE_DEBOUNCE);

    // Cleanup on dependency change / unmount
    return () => {
      if (cloudSaveTimeoutRef.current) {
        clearTimeout(cloudSaveTimeoutRef.current);
      }
    };
  }, [dogState, dispatch, firebaseReady, auth?.currentUser]);

  // 4. Game loop tick (every 60 seconds → decay + polls)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      dispatch(tickDog({ now }));
      dispatch(tickDogPolls({ now }));
      // Simple weather effects (applied once per tick ~60s)
      // Apply weather effects via reducer to avoid mutating selector state directly
      if (weather === "rain") {
        dispatch(applyWeatherEffects({ cleanlinessDelta: -5 }));
      } else if (weather === "snow") {
        dispatch(applyWeatherEffects({ energyDelta: -10 }));
      }
    }, TICK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [dispatch, dogState, weather]);

  // Headless "brain" component: never renders UI
  return null;
}
