// src/features/game/DogAIEngine.jsx
// @ts-nocheck

import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";

// Use the firebase client we defined earlier
import { auth } from "@/lib/firebaseClient.js";

import {
  hydrateDog,
  tickDog,
  tickDogAutonomy,
  registerSessionStart,
  tickDogPolls,
  selectDog,
  DOG_STORAGE_KEY,
} from "@/redux/dogSlice.js";

import { selectWeatherCondition } from "@/redux/weatherSlice.js";
import { loadDogFromCloud, saveDogToCloud } from "@/redux/dogThunks.js";

const DECAY_TICK_INTERVAL_MS = 60_000; // 60 seconds (stats/decay)
const AUTONOMY_TICK_INTERVAL_MS = 15_000; // 15 seconds (alive-feel)
const POLL_TICK_INTERVAL_MS = 5_000; // 5 seconds (prompt expiry feels responsive)
const CLOUD_SAVE_DEBOUNCE = 3_000; // 3 seconds
const LOCAL_SAVE_DEBOUNCE = 150; // debounce localStorage writes

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dogState = useSelector(selectDog);
  const weather = useSelector(selectWeatherCondition);

  const hasHydratedRef = useRef(false);
  const cloudSaveTimeoutRef = useRef(null);
  const localSaveTimeoutRef = useRef(null);
  const lastLocalCopyRef = useRef(null);

  // Helper: revive common date-like fields saved as ISO strings back to numbers
  const reviveDogDates = (raw) => {
    if (!raw || typeof raw !== "object") return raw;
    const copy = { ...raw };
    const tryParse = (v) => {
      if (typeof v === "string") {
        const t = Date.parse(v);
        return Number.isFinite(t) ? t : v;
      }
      return v;
    };

    copy.adoptedAt = tryParse(copy.adoptedAt);
    copy.lastUpdatedAt = tryParse(copy.lastUpdatedAt);

    if (copy.memory && typeof copy.memory === "object") {
      copy.memory = { ...copy.memory };
      copy.memory.lastFedAt = tryParse(copy.memory.lastFedAt);
      copy.memory.lastPlayedAt = tryParse(copy.memory.lastPlayedAt);
      copy.memory.lastBathedAt = tryParse(copy.memory.lastBathedAt);
      copy.memory.lastTrainedAt = tryParse(copy.memory.lastTrainedAt);
      copy.memory.lastSeenAt = tryParse(copy.memory.lastSeenAt);
    }

    if (copy.temperament && typeof copy.temperament === "object") {
      copy.temperament = { ...copy.temperament };
      copy.temperament.adoptedAt = tryParse(copy.temperament.adoptedAt);
      copy.temperament.revealedAt = tryParse(copy.temperament.revealedAt);
      copy.temperament.lastEvaluatedAt = tryParse(
        copy.temperament.lastEvaluatedAt,
      );
    }

    if (copy.training && typeof copy.training === "object") {
      copy.training = { ...copy.training };
      if (copy.training.potty) {
        copy.training.potty = { ...copy.training.potty };
        copy.training.potty.completedAt = tryParse(
          copy.training.potty.completedAt,
        );
      }
      if (copy.training.adult) {
        copy.training.adult = { ...copy.training.adult };
        copy.training.adult.lastCompletedDate = tryParse(
          copy.training.adult.lastCompletedDate,
        );
        copy.training.adult.lastPenaltyDate = tryParse(
          copy.training.adult.lastPenaltyDate,
        );
      }
    }

    // Progression dates
    if (copy.progression && typeof copy.progression === "object") {
      copy.progression = { ...copy.progression };
      if (copy.progression.season && typeof copy.progression.season === "object") {
        copy.progression.season = { ...copy.progression.season };
        copy.progression.season.startedAt = tryParse(copy.progression.season.startedAt);
        copy.progression.season.endsAt = tryParse(copy.progression.season.endsAt);
      }
      if (copy.progression.journey && typeof copy.progression.journey === "object") {
        copy.progression.journey = { ...copy.progression.journey };
        copy.progression.journey.startedAt = tryParse(copy.progression.journey.startedAt);
      }
    }

    // Autonomy dates
    if (copy.autonomy && typeof copy.autonomy === "object") {
      copy.autonomy = { ...copy.autonomy };
      copy.autonomy.nextDecisionAt = tryParse(copy.autonomy.nextDecisionAt);
      copy.autonomy.lastDecisionAt = tryParse(copy.autonomy.lastDecisionAt);
      if (copy.autonomy.lastEvent && typeof copy.autonomy.lastEvent === "object") {
        copy.autonomy.lastEvent = { ...copy.autonomy.lastEvent };
        copy.autonomy.lastEvent.createdAt = tryParse(copy.autonomy.lastEvent.createdAt);
        copy.autonomy.lastEvent.expiresAt = tryParse(copy.autonomy.lastEvent.expiresAt);
      }
      if (copy.autonomy.routine && typeof copy.autonomy.routine === "object") {
        copy.autonomy.routine = { ...copy.autonomy.routine };
        copy.autonomy.routine.updatedAt = tryParse(copy.autonomy.routine.updatedAt);
      }
    }

    if (Array.isArray(copy.journal)) {
      copy.journal = copy.journal.map((e) => ({
        ...e,
        timestamp: tryParse(e.timestamp),
      }));
    } else if (copy.journal && Array.isArray(copy.journal.entries)) {
      copy.journal = {
        ...copy.journal,
        entries: copy.journal.entries.map((e) => ({
          ...e,
          timestamp: tryParse(e.timestamp),
        })),
      };
    }

    if (copy.mood && Array.isArray(copy.mood.history)) {
      copy.mood = {
        ...copy.mood,
        history: copy.mood.history.map((h) => ({
          ...h,
          timestamp: tryParse(h.timestamp),
        })),
      };
    }

    return copy;
  };

  // 1. Hydrate on first mount (localStorage → Redux, then optional cloud)
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    // LocalStorage hydrate
    try {
      const localData = localStorage.getItem(DOG_STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        const revived = reviveDogDates(parsed);
        dispatch(hydrateDog(revived));
        console.log("[Doggerz] Hydrated dog from localStorage");
      }
    } catch (err) {
      console.error("[Doggerz] Failed to parse localStorage dog data", err);
    }

    // Cloud hydrate if logged in at mount time
    if (auth && auth.currentUser) {
      const thunkPromise = dispatch(loadDogFromCloud());

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

  // 2. Debounced save to localStorage on dog state change (reduces IO)
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return; // no adopted dog yet

    try {
      const copy = JSON.parse(JSON.stringify(dogState));
      lastLocalCopyRef.current = copy;

      if (localSaveTimeoutRef.current)
        clearTimeout(localSaveTimeoutRef.current);
      localSaveTimeoutRef.current = setTimeout(() => {
        try {
          localStorage.setItem(
            DOG_STORAGE_KEY,
            JSON.stringify(lastLocalCopyRef.current),
          );
        } catch (err) {
          console.error("[Doggerz] Failed to save to localStorage", err);
        }
        localSaveTimeoutRef.current = null;
        lastLocalCopyRef.current = null;
      }, LOCAL_SAVE_DEBOUNCE);
    } catch (err) {
      console.error("[Doggerz] Failed to schedule localStorage save", err);
    }

    return () => {
      if (localSaveTimeoutRef.current) {
        clearTimeout(localSaveTimeoutRef.current);
        localSaveTimeoutRef.current = null;
      }
    };
  }, [dogState]);

  // Flush pending local save on unload to avoid data loss
  useEffect(() => {
    const flush = () => {
      try {
        if (localSaveTimeoutRef.current && lastLocalCopyRef.current) {
          clearTimeout(localSaveTimeoutRef.current);
          localStorage.setItem(
            DOG_STORAGE_KEY,
            JSON.stringify(lastLocalCopyRef.current),
          );
          localSaveTimeoutRef.current = null;
          lastLocalCopyRef.current = null;
        }
      } catch (e) {
        /* ignore */
      }
    };

    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, []);

  // 3. Debounced cloud save whenever dogState changes while logged in
  useEffect(() => {
    if (!dogState || !dogState.adoptedAt) return;
    if (!auth || !auth.currentUser) return;

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
  }, [dogState, dispatch]);

  // 4. Game loop tick (every 60 seconds → decay + polls)
  // IMPORTANT: we DO NOT mutate dogState here. All changes go through reducers.
  useEffect(() => {
    const decayId = setInterval(() => {
      const now = Date.now();
      dispatch(tickDog({ now, weather }));
    }, DECAY_TICK_INTERVAL_MS);

    const autonomyId = setInterval(() => {
      const now = Date.now();
      dispatch(tickDogAutonomy({ now, weather }));
    }, AUTONOMY_TICK_INTERVAL_MS);

    const pollId = setInterval(() => {
      const now = Date.now();
      dispatch(tickDogPolls({ now }));
    }, POLL_TICK_INTERVAL_MS);

    return () => {
      clearInterval(decayId);
      clearInterval(autonomyId);
      clearInterval(pollId);
    };
  }, [dispatch, weather]);

  // Headless "brain" component: never renders UI
  return null;
}
