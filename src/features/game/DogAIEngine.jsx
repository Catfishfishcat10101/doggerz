// src/features/game/DogAIEngine.jsx
// @ts-nocheck  // remove this line if you want TS to type-check this file

import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { auth, firebaseReady } from "@/firebase.js";
import {
  hydrateDog,
  tickDog,
  registerSessionStart,
  tickDogPolls,
  selectDog,
  DOG_STORAGE_KEY,
} from "@/redux/dogSlice.js";
import { loadDogFromCloud, saveDogToCloud } from "@/redux/dogThunks.js";

const TICK_INTERVAL_MS = 60_000; // 60 seconds
const CLOUD_SAVE_DEBOUNCE = 3_000; // 3 seconds

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dogState = useSelector(selectDog);

  const hasHydratedRef = useRef(false);
  const cloudSaveTimeoutRef = useRef(null);

  // 1. Hydrate on mount (localStorage → Redux + optional cloud)
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

    // Cloud hydrate if logged in
    if (firebaseReady && auth?.currentUser) {
      const thunkPromise = dispatch(loadDogFromCloud());

      // RTK's unwrap if available; fall back to plain catch
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

    // Register session start (handles catch-up decay, penalties, etc.)
    dispatch(registerSessionStart({ now: Date.now() }));
  }, [dispatch]);

  // 2. Save to localStorage on every dog state change
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return; // no dog yet

    try {
      localStorage.setItem(DOG_STORAGE_KEY, JSON.stringify(dogState));
    } catch (err) {
      console.error("[Doggerz] Failed to save to localStorage", err);
    }
  }, [dogState]);

  // 3. Debounced cloud save
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return;
    if (!firebaseReady || !auth?.currentUser) return;

    // Clear existing timeout if any
    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
    }

    // Set new timeout
    cloudSaveTimeoutRef.current = setTimeout(() => {
      dispatch(saveDogToCloud());
    }, CLOUD_SAVE_DEBOUNCE);

    // Cleanup if deps change / unmount
    return () => {
      if (cloudSaveTimeoutRef.current) {
        clearTimeout(cloudSaveTimeoutRef.current);
      }
    };
  }, [dogState, dispatch]);

  // 4. Game loop tick (every 60 seconds)
  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = Date.now();
      dispatch(tickDog({ now }));
      dispatch(tickDogPolls({ now }));
    }, TICK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  // This is a headless "brain" component: no UI
  return null;
}
