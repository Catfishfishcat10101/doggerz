import { describe, expect, it } from "vitest";

import {
  calculateTimeDecay,
  simulateDogTime,
} from "@/features/dog/dogEngine.js";

describe("dogEngine decay safety", () => {
  it("keeps bladder decaying below the red zone so accidents can trigger", () => {
    const tuning = {
      tick: {
        stepMinutes: 10,
        fullSimMinutes: 60,
        extraSimDecayMultiplier: 0.25,
        extraSimFloor: 25,
      },
      wellbeing: {
        protectMin: 1,
        drainPerMinute: 0,
        regenPerMinuteWhenFine: 0,
        fragileThreshold: 10,
      },
      careDebt: {
        buildPerMinute: 0,
        buildExtraWhenWellbeingEmpty: 0,
        forgivePerMinuteWhenFine: 0,
        cap: 100,
      },
      accidents: {
        triggerAtOrBelow: 10,
        cooldownMinutes: 0,
        relieveTo: 80,
        cleanlinessPenalty: 10,
        happinessPenalty: 6,
        careDebtPenalty: 4,
      },
      sleep: {
        enterNapAtOrBelow: 0,
        wakeAtOrAbove: 100,
        maxNapMinutes: 90,
        hungerDecayMultiplierWhileNapping: 1,
        happinessDecayMultiplierWhileNapping: 1,
        bladderDecayMultiplierWhileNapping: 1,
        cleanlinessDecayMultiplierWhileNapping: 1,
      },
      lifeStages: {
        adult: {
          hoursTo40: {
            hunger: 100,
            energy: 100,
            happiness: 100,
            cleanliness: 100,
            bladder: 1,
            affection: 100,
            mentalStimulation: 100,
          },
          energyRecoverPerMinuteWhileNapping: 0.4,
          globalDecayMultiplier: 1,
        },
      },
    };

    const result = simulateDogTime(
      {
        lifeStage: { stage: "ADULT" },
        stats: {
          hunger: 90,
          energy: 90,
          happiness: 90,
          cleanliness: 90,
          bladder: 12,
          affection: 90,
          mentalStimulation: 90,
        },
        wellbeing: 100,
        careDebt: 0,
        sleep: { mode: "awake", napMinutesLeft: 0 },
        messCount: 0,
        lastAccidentAt: 0,
      },
      10 * 60 * 1000,
      Date.now(),
      tuning
    );

    expect(result.messCount).toBe(1);
    expect(result.lastAccidentAt).toBeGreaterThan(0);
    expect(result.stats.bladder).toBe(80);
  });

  it("falls back to safe numeric defaults for bad decay multipliers", () => {
    const next = calculateTimeDecay(
      {
        hunger: 40,
        happiness: 80,
      },
      2,
      {
        stageMultiplier: "abc",
        vacationEnabled: true,
        vacationMultiplier: "nope",
      }
    );

    expect(next.hunger).toBeGreaterThan(40);
    expect(next.happiness).toBeGreaterThan(0);
    expect(next.happiness).toBeLessThan(80);
  });

  it("includes health in the advanced simulation decay path", () => {
    const tuning = {
      tick: {
        stepMinutes: 10,
        fullSimMinutes: 60,
        extraSimDecayMultiplier: 0.25,
        extraSimFloor: 25,
      },
      wellbeing: {
        protectMin: 1,
        drainPerMinute: 0,
        regenPerMinuteWhenFine: 0,
        fragileThreshold: 10,
      },
      careDebt: {
        buildPerMinute: 0,
        buildExtraWhenWellbeingEmpty: 0,
        forgivePerMinuteWhenFine: 0,
        cap: 100,
      },
      accidents: {
        triggerAtOrBelow: 10,
        cooldownMinutes: 0,
        relieveTo: 80,
        cleanlinessPenalty: 10,
        happinessPenalty: 6,
        careDebtPenalty: 4,
      },
      sleep: {
        enterNapAtOrBelow: 0,
        wakeAtOrAbove: 100,
        maxNapMinutes: 90,
        hungerDecayMultiplierWhileNapping: 1,
        happinessDecayMultiplierWhileNapping: 1,
        bladderDecayMultiplierWhileNapping: 1,
        cleanlinessDecayMultiplierWhileNapping: 1,
      },
      lifeStages: {
        adult: {
          hoursTo40: {
            hunger: 100,
            energy: 100,
            happiness: 100,
            cleanliness: 100,
            health: 1,
            bladder: 100,
            affection: 100,
            mentalStimulation: 100,
          },
          energyRecoverPerMinuteWhileNapping: 0.4,
          globalDecayMultiplier: 1,
        },
      },
    };

    const result = simulateDogTime(
      {
        lifeStage: { stage: "ADULT" },
        stats: {
          hunger: 90,
          energy: 90,
          happiness: 90,
          cleanliness: 90,
          health: 90,
          bladder: 90,
          affection: 90,
          mentalStimulation: 90,
        },
        wellbeing: 100,
        careDebt: 0,
        sleep: { mode: "awake", napMinutesLeft: 0 },
        messCount: 0,
        lastAccidentAt: 0,
      },
      10 * 60 * 1000,
      Date.now(),
      tuning
    );

    expect(result.stats.health).toBeLessThan(90);
  });
});
