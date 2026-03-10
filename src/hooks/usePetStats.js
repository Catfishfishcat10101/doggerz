/** @format */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  applyPetStatDecay,
  CORE_PET_STAT_DECAY_PER_HOUR,
  normalizePetStats,
} from "@/logic/PetStatsManager.js";
import {
  addBondExperience,
  createExperienceState,
  getLevelProgress,
} from "@/logic/ExperienceAndLeveling.js";
import {
  getElapsedHoursAfterGrace,
  HUNGER_FULLNESS_BUFFER_HOURS,
} from "@/logic/OfflineProgressCalculator.js";

const MS_PER_HOUR = 60 * 60 * 1000;

function clamp(n, lo = 0, hi = 100) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function buildDecayByStat(hoursElapsed) {
  const h = Math.max(0, Number(hoursElapsed) || 0);
  const decayByStat = {};
  Object.keys(CORE_PET_STAT_DECAY_PER_HOUR).forEach((key) => {
    decayByStat[key] = Number(CORE_PET_STAT_DECAY_PER_HOUR[key] || 0) * h;
  });
  return decayByStat;
}

function computeDangerFromStats(stats) {
  const s = stats && typeof stats === "object" ? stats : {};
  const hungerNeed = clamp(Number(s.hunger || 0), 0, 100);
  const thirstNeed = clamp(Number(s.thirst || 0), 0, 100);
  const energyNeed = 100 - clamp(Number(s.energy || 0), 0, 100);
  const cleanlinessNeed = 100 - clamp(Number(s.cleanliness || 0), 0, 100);
  const healthNeed = 100 - clamp(Number(s.health || 0), 0, 100);
  const happinessNeed = 100 - clamp(Number(s.happiness || 0), 0, 100);

  const pressure =
    (hungerNeed +
      thirstNeed +
      energyNeed +
      cleanlinessNeed +
      healthNeed +
      happinessNeed) /
    6;
  return clamp(Math.round(pressure));
}

function getHealthWarningTier(dangerPct) {
  const d = clamp(Number(dangerPct) || 0, 0, 100);
  if (d >= 75) return "critical";
  if (d >= 55) return "warning";
  return "ok";
}

/**
 * Local (non-Redux) pet stats hook.
 *
 * - Passive timer: applies time-based decay.
 * - Active actions: mutate stats immediately.
 *
 * This hook intentionally does not persist or sync; callers can wire that up
 * via `onChange` or by reading `stats` and saving elsewhere.
 */
export function usePetStats(options = {}) {
  const {
    initialStats = {},
    defaults = {},
    experience: initialExperience = null,
    initialLastFedAt = null,
    tickIntervalMs = 60_000,
    sleeping = false,
    energyRecoveryPerHour = 0,
    perLevelDecaySlowdown = 0.03,
    xpAwards = null,
    onChange = null,
  } = options;

  const initial = useMemo(
    () => normalizePetStats(initialStats, defaults),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [stats, setStats] = useState(initial);
  const [experience, setExperience] = useState(() =>
    createExperienceState(initialExperience || {})
  );
  const level = Math.max(1, Math.floor(Number(experience?.level || 1)));

  const sleepingRef = useRef(Boolean(sleeping));
  const lastFedAtRef = useRef(
    Number.isFinite(Number(initialLastFedAt)) ? Number(initialLastFedAt) : null
  );
  useEffect(() => {
    sleepingRef.current = Boolean(sleeping);
  }, [sleeping]);

  const lastTickAtRef = useRef(Date.now());

  const applyNext = useCallback(
    (updater) => {
      setStats((prev) => {
        const next = updater(prev);
        const normalized = normalizePetStats(next, defaults);
        if (typeof onChange === "function") onChange(normalized);
        return normalized;
      });
    },
    [defaults, onChange]
  );

  const awardXp = useCallback(
    (amount) => {
      const gained = Math.max(0, Math.floor(Number(amount) || 0));
      if (!gained) {
        return {
          leveledUp: false,
          levelsGained: 0,
          growthTriggered: false,
          newMilestones: [],
          state: experience,
          progress: getLevelProgress(experience),
        };
      }

      let result = null;
      setExperience((prev) => {
        result = addBondExperience(prev, gained);
        return result.state;
      });
      return result;
    },
    [experience]
  );

  const tick = useCallback(
    (now = Date.now()) => {
      const last = Number(lastTickAtRef.current || 0);
      lastTickAtRef.current = now;
      if (!last) return;

      const dtMs = Math.max(0, now - last);
      if (!dtMs) return;

      const hoursElapsed = dtMs / MS_PER_HOUR;
      const decayByStat = buildDecayByStat(hoursElapsed);
      const hungerDecayHours = Number.isFinite(Number(lastFedAtRef.current))
        ? Math.max(
            0,
            getElapsedHoursAfterGrace(
              lastFedAtRef.current,
              now,
              HUNGER_FULLNESS_BUFFER_HOURS
            ) -
              getElapsedHoursAfterGrace(
                lastFedAtRef.current,
                last,
                HUNGER_FULLNESS_BUFFER_HOURS
              )
          )
        : hoursElapsed;
      decayByStat.hunger =
        Number(CORE_PET_STAT_DECAY_PER_HOUR.hunger || 0) * hungerDecayHours;
      const energyRecoveryGain =
        (Number(energyRecoveryPerHour || 0) * hoursElapsed) / 1;

      applyNext((prev) =>
        applyPetStatDecay({
          stats: prev,
          decayByStat,
          sleeping: sleepingRef.current,
          energyRecoveryGain,
          level,
          perLevelSlowdown: perLevelDecaySlowdown,
        })
      );
    },
    [applyNext, energyRecoveryPerHour, level, perLevelDecaySlowdown]
  );

  useEffect(() => {
    const ms = Math.max(250, Math.floor(Number(tickIntervalMs) || 0));
    if (!ms) return undefined;

    const id = window.setInterval(() => tick(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [tick, tickIntervalMs]);

  const actionXp = useMemo(() => {
    const defaults = {
      feed: 4,
      giveWater: 2,
      pet: 2,
      play: 5,
      rest: 1,
    };
    if (!xpAwards || typeof xpAwards !== "object") return defaults;
    return { ...defaults, ...xpAwards };
  }, [xpAwards]);

  // ----- Active actions (simple wrappers) -----
  const feed = useCallback(
    ({ amount = 25 } = {}) => {
      const a = clamp(amount, 0, 100);
      lastFedAtRef.current = Date.now();
      applyNext((prev) => ({
        ...prev,
        hunger: clamp(Number(prev.hunger || 0) - a, 0, 100),
        happiness: clamp(Number(prev.happiness || 0) + a * 0.08, 0, 100),
      }));
      return awardXp(actionXp.feed);
    },
    [actionXp.feed, applyNext, awardXp]
  );

  const giveWater = useCallback(
    ({ amount = 25 } = {}) => {
      const a = clamp(amount, 0, 100);
      applyNext((prev) => ({
        ...prev,
        thirst: clamp(Number(prev.thirst || 0) - a, 0, 100),
        happiness: clamp(Number(prev.happiness || 0) + a * 0.05, 0, 100),
      }));
      return awardXp(actionXp.giveWater);
    },
    [actionXp.giveWater, applyNext, awardXp]
  );

  const pet = useCallback(() => {
    applyNext((prev) => ({
      ...prev,
      happiness: clamp(Number(prev.happiness || 0) + 6, 0, 100),
      affection: clamp(Number(prev.affection || 0) + 8, 0, 100),
    }));
    return awardXp(actionXp.pet);
  }, [actionXp.pet, applyNext, awardXp]);

  const play = useCallback(() => {
    applyNext((prev) => ({
      ...prev,
      happiness: clamp(Number(prev.happiness || 0) + 10, 0, 100),
      mentalStimulation: clamp(
        Number(prev.mentalStimulation || 0) + 12,
        0,
        100
      ),
      energy: clamp(Number(prev.energy || 0) - 5, 0, 100),
    }));
    return awardXp(actionXp.play);
  }, [actionXp.play, applyNext, awardXp]);

  const rest = useCallback(() => {
    // Caller can also pass `sleeping: true` to the hook for passive recovery.
    applyNext((prev) => ({
      ...prev,
      energy: clamp(Number(prev.energy || 0) + 8, 0, 100),
      happiness: clamp(Number(prev.happiness || 0) + 2, 0, 100),
    }));
    return awardXp(actionXp.rest);
  }, [actionXp.rest, applyNext, awardXp]);

  const tickNow = useCallback(() => tick(Date.now()), [tick]);

  const dangerPct = useMemo(() => computeDangerFromStats(stats), [stats]);
  const healthWarning = useMemo(
    () => ({
      dangerPct,
      tier: getHealthWarningTier(dangerPct),
    }),
    [dangerPct]
  );

  const isStarving = clamp(Number(stats?.hunger ?? 0), 0, 100) >= 85;

  return {
    stats,
    setStats: applyNext,
    experience,
    level,
    levelProgress: getLevelProgress(experience),
    healthWarning,
    isStarving,
    tickNow,
    feed,
    feedPet: feed,
    giveWater,
    pet,
    play,
    rest,
  };
}
