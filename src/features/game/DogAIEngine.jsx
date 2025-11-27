// src/features/game/DogAIEngine.jsx
// @ts-nocheck

import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { auth, firebaseReady } from "@/firebase.js";
import {
  hydrateDog,
  engineTick,
  selectDog,
  DOG_STORAGE_KEY,
} from "@/redux/dogSlice.js";
import { loadDogFromCloud, saveDogToCloud } from "@/redux/dogThunks.js";
import { loadSettings } from "@/utils/settings.js";

const TICK_INTERVAL_MS = 60_000; // 60 seconds
const CLOUD_SAVE_DEBOUNCE = 3_000; // 3 seconds

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dogState = useSelector(selectDog);

  const hasHydratedRef = useRef(false);
  const cloudSaveTimeoutRef = useRef(null);

  // 1. Hydrate on first mount (localStorage → Redux, then optional cloud)
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    // LocalStorage hydrate
    try {
      const localData = window.localStorage.getItem(DOG_STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        dispatch(hydrateDog(parsed));
        console.info("[Doggerz] Hydrated dog from localStorage");
      }
    } catch (err) {
      console.error("[Doggerz] Failed to parse localStorage dog data", err);
    }

    // Cloud hydrate if logged in at mount time. Respect a local dev flag
    // `doggerz:cloudDisabled` so permission-denied errors don't spam the console.
    try {
      const cloudDisabled = window.localStorage.getItem(
        "doggerz:cloudDisabled",
      );
      if (!cloudDisabled && firebaseReady && auth?.currentUser) {
        console.debug("[Doggerz] Attempting cloud hydrate", {
          uid: auth.currentUser?.uid,
        });
        const thunkPromise = dispatch(loadDogFromCloud());
        if (thunkPromise && typeof thunkPromise.unwrap === "function") {
          thunkPromise.unwrap().catch((err) => {
            console.error("[Doggerz] Failed to load dog from cloud", err);
            try {
              if (
                err?.code === "permission-denied" ||
                String(err?.message || "")
                  .toLowerCase()
                  .includes("insufficient permissions")
              ) {
                window.localStorage.setItem("doggerz:cloudDisabled", "1");
                console.warn(
                  "[Doggerz] Cloud sync disabled due to permission errors",
                );
              }
            } catch (e) {
              /* ignore */
            }
          });
        } else if (thunkPromise?.catch) {
          thunkPromise.catch((err) => {
            console.error("[Doggerz] Failed to load dog from cloud", err);
            try {
              if (
                err?.code === "permission-denied" ||
                String(err?.message || "")
                  .toLowerCase()
                  .includes("insufficient permissions")
              ) {
                window.localStorage.setItem("doggerz:cloudDisabled", "1");
                console.warn(
                  "[Doggerz] Cloud sync disabled due to permission errors",
                );
              }
            } catch (e) {
              /* ignore */
            }
          });
        }
      }
    } catch (e) {
      // If localStorage is unavailable for any reason, just proceed silently
    }

    // Run a single tick to catch up immediately
    dispatch(engineTick({ now: Date.now() }));
  }, [dispatch]);

  // If user logs in after mount, pull from cloud once
  useEffect(() => {
    if (!firebaseReady) return;
    if (!auth?.currentUser) return;
    if (!hasHydratedRef.current) return;

    try {
      const cloudDisabled = window.localStorage.getItem(
        "doggerz:cloudDisabled",
      );
      if (!cloudDisabled) {
        console.debug("[Doggerz] Attempting late cloud hydrate", {
          uid: auth.currentUser?.uid,
        });
        const thunkPromise = dispatch(loadDogFromCloud());
        if (thunkPromise && typeof thunkPromise.unwrap === "function") {
          thunkPromise.unwrap().catch((err) => {
            console.error("[Doggerz] Late cloud load failed", err);
            try {
              if (
                err?.code === "permission-denied" ||
                String(err?.message || "")
                  .toLowerCase()
                  .includes("insufficient permissions")
              ) {
                window.localStorage.setItem("doggerz:cloudDisabled", "1");
                console.warn(
                  "[Doggerz] Cloud sync disabled due to permission errors",
                );
              }
            } catch (e) {
              /* ignore */
            }
          });
        } else if (thunkPromise?.catch) {
          thunkPromise.catch((err) => {
            console.error("[Doggerz] Late cloud load failed", err);
            try {
              if (
                err?.code === "permission-denied" ||
                String(err?.message || "")
                  .toLowerCase()
                  .includes("insufficient permissions")
              ) {
                window.localStorage.setItem("doggerz:cloudDisabled", "1");
                console.warn(
                  "[Doggerz] Cloud sync disabled due to permission errors",
                );
              }
            } catch (e) {
              /* ignore */
            }
          });
        }
      }
    } catch (e) {
      // ignore localStorage failures
    }

    // Also run a session tick
    dispatch(engineTick({ now: Date.now() }));
  }, [dispatch, firebaseReady, auth?.currentUser]);

  // Save to localStorage on every dog state change
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return;

    try {
      window.localStorage.setItem(DOG_STORAGE_KEY, JSON.stringify(dogState));
    } catch (err) {
      console.error("[Doggerz] Failed to save to localStorage", err);
    }
  }, [dogState]);

  // Debounced cloud save whenever dogState changes while logged in
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return;
    if (!firebaseReady || !auth?.currentUser) return;

    if (cloudSaveTimeoutRef.current) {
      clearTimeout(cloudSaveTimeoutRef.current);
    }

    cloudSaveTimeoutRef.current = setTimeout(() => {
      try {
        const appSettings = loadSettings();
        if (!appSettings.allowCloudSync) {
          console.info(
            "[Doggerz] Cloud sync disabled by settings; skipping save.",
          );
          return;
        }
      } catch (e) {
        // proceed with save if settings cannot be read
      }
      dispatch(saveDogToCloud());
    }, CLOUD_SAVE_DEBOUNCE);

    return () => {
      if (cloudSaveTimeoutRef.current) {
        clearTimeout(cloudSaveTimeoutRef.current);
      }
    };
  }, [dogState, dispatch, firebaseReady, auth?.currentUser]);

  // Game loop tick (every 60 seconds → decay)
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(engineTick({ now: Date.now() }));
    }, TICK_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [dispatch]);

  return null;
}
