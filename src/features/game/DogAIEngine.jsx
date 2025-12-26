// src/features/game/DogAIEngine.jsx
// @ts-nocheck

import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseReady } from "@/firebase.js";
import {
  hydrateDog,
  tickDog,
  registerSessionStart,
  tickDogPolls,
  selectDog,
  DOG_STORAGE_KEY,
} from "@/redux/dogSlice.js";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";
import { loadDogFromCloud, saveDogToCloud } from "@/redux/dogThunks.js";

const TICK_INTERVAL_MS = 60_000; // 60 seconds
const CLOUD_SAVE_DEBOUNCE = 3_000; // 3 seconds

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dogState = useSelector(selectDog);
  const weather = useSelector(selectWeatherCondition);

  const hasHydratedRef = useRef(false);
  const cloudSaveTimeoutRef = useRef(null);
  const localSaveTimeoutRef = useRef(null);
  const weatherRef = useRef(weather);
  const adoptedRef = useRef(Boolean(dogState?.adoptedAt));
  const userIdRef = useRef(null);
  const tickIntervalRef = useRef(null);

  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  useEffect(() => {
    adoptedRef.current = Boolean(dogState?.adoptedAt);
  }, [dogState?.adoptedAt]);

  // Track auth changes reactively (auth.currentUser is not a reactive value by itself).
  useEffect(() => {
    if (!firebaseReady || !auth) return;
    const unsub = onAuthStateChanged(auth, (user) => {
      userIdRef.current = user?.uid || null;
    });
    return () => {
      try {
        unsub();
      } catch {
        // ignore
      }
    };
  }, [firebaseReady]);

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
    if (!userIdRef.current) return;
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
  }, [dispatch, firebaseReady]);

  // 2. Debounced save to localStorage (reduces churn as state grows: journal, mood history, etc.)
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return; // no adopted dog yet

    if (localSaveTimeoutRef.current) {
      clearTimeout(localSaveTimeoutRef.current);
    }

    localSaveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(DOG_STORAGE_KEY, JSON.stringify(dogState));
      } catch (err) {
        console.error("[Doggerz] Failed to save to localStorage", err);
      }
    }, 400);

    return () => {
      if (localSaveTimeoutRef.current) {
        clearTimeout(localSaveTimeoutRef.current);
        localSaveTimeoutRef.current = null;
      }
    };
  }, [dogState]);

  // 3. Debounced cloud save whenever dogState changes while logged in
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return;
    if (!firebaseReady || !userIdRef.current) return;

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
  }, [dogState, dispatch, firebaseReady]);

  // 4. Game loop tick (every 60 seconds → decay + polls). Keep the interval stable.
  useEffect(() => {
    const tickOnce = () => {
      if (document?.hidden) return; // save battery on mobile when backgrounded
      if (!adoptedRef.current) return;
      const now = Date.now();
      const w = weatherRef.current;
      dispatch(tickDog({ now, weather: w }));
      dispatch(tickDogPolls({ now }));
    };

    // Clear any existing interval before creating a new one.
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
    }

    tickIntervalRef.current = setInterval(tickOnce, TICK_INTERVAL_MS);

    // Also tick when returning to the tab.
    const onVisibility = () => {
      if (!document.hidden) tickOnce();
    };
    window.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("visibilitychange", onVisibility);
      if (tickIntervalRef.current) {
        clearInterval(tickIntervalRef.current);
        tickIntervalRef.current = null;
      }
    };
  }, [dispatch]);

  // Headless "brain" component: never renders UI
  return null;
}
