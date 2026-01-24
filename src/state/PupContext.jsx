/* eslint-disable react-refresh/only-export-components */

// src/state/PupContext.jsx
import * as React from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  addXp,
  goPotty,
  recordAccident,
  removeXp,
  selectDog,
} from "@/redux/dogSlice.js";

const PupContext = React.createContext(null);
export default PupContext;

export function usePup() {
  return React.useContext(PupContext);
}

function buildPupFromDog(dog) {
  const safeDog = dog && typeof dog === "object" ? dog : {};
  const trainingPotty = safeDog.training?.potty || {};
  const goal = Number(trainingPotty.goal || 0);
  const successes = Number(trainingPotty.successCount || 0);
  const pottyTrainingPct = goal ? Math.round((successes / goal) * 100) : 0;

  return {
    // identity
    name: safeDog.name || "Pup",

    // XP + leveling
    xp: Number(safeDog.xp || 0),
    xpToNext: Number(safeDog.xpToNextLevel || safeDog.xpToNext || 0),
    trainingLevel: Number(safeDog.level || 1),

    // Potty system
    accidents: Number(safeDog.potty?.totalAccidents || 0),
    pottySuccesses: successes,
    pottyGoal: goal,
    pottyTrainingPct,
    lastPottySuccessAt: safeDog.potty?.lastSuccessAt ?? null,
    lastPottyAccidentAt: safeDog.potty?.lastAccidentAt ?? null,

    // Temperament
    temperament: safeDog.temperament || null,

    // Memories & dreams (expose raw state for now; higher-level shaping later)
    memories: safeDog.journal?.entries || [],
    dreams: safeDog.dreams?.journal || [],

    // Badges
    badges: safeDog.badges || [],

    // Mood
    mood: safeDog.mood || null,
  };
}

export function PupProvider({ children }) {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  const pup = React.useMemo(() => buildPupFromDog(dog), [dog]);

  const addXP = React.useCallback(
    (amount) => {
      dispatch(addXp({ amount }));
    },
    [dispatch]
  );

  const removeXP = React.useCallback(
    (amount) => {
      dispatch(removeXp({ amount }));
    },
    [dispatch]
  );

  const logPottySuccess = React.useCallback(() => {
    dispatch(goPotty({ now: Date.now() }));
  }, [dispatch]);

  const logAccident = React.useCallback(() => {
    dispatch(recordAccident({ now: Date.now() }));
  }, [dispatch]);

  // Stubs for future migration away from Redux (kept non-throwing).
  const addMemory = React.useCallback(() => {}, []);
  const addDream = React.useCallback(() => {}, []);
  const setTemperament = React.useCallback(() => {}, []);
  const awardBadge = React.useCallback(() => {}, []);

  const value = React.useMemo(
    () => ({
      pup,
      addXP,
      removeXP,
      logPottySuccess,
      logAccident,
      addMemory,
      addDream,
      setTemperament,
      awardBadge,
    }),
    [
      pup,
      addXP,
      removeXP,
      logPottySuccess,
      logAccident,
      addMemory,
      addDream,
      setTemperament,
      awardBadge,
    ]
  );

  return <PupContext.Provider value={value}>{children}</PupContext.Provider>;
}

// usePup hook was previously split for fast refresh compatibility; keeping it
// here avoids broken imports during repo cleanup.
