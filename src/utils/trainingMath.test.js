/** @format */

import { describe, expect, it } from "vitest";
import {
  computeTrainingDifficulty,
  computeTrainingOutcome,
  computeTrainingSuccessChance,
  formatChancePercent,
} from "./trainingMath";

describe("trainingMath", () => {
  it("keeps success chance within expected bounds", () => {
    const voiceChance = computeTrainingSuccessChance({
      input: "voice",
      bond: 0,
      energy: 0,
      hunger: 100,
      thirst: 100,
      happiness: 0,
      stress: 100,
      distraction: 100,
      difficulty: "expert",
    });

    const buttonChance = computeTrainingSuccessChance({
      input: "button",
      bond: 100,
      energy: 100,
      focus: 100,
      trust: 100,
      stress: 0,
      distraction: 0,
      difficulty: "easy",
    });

    expect(voiceChance).toBeGreaterThanOrEqual(0.3);
    expect(voiceChance).toBeLessThanOrEqual(0.98);
    expect(buttonChance).toBeGreaterThanOrEqual(0.4);
    expect(buttonChance).toBeLessThanOrEqual(0.98);
  });

  it("increases success chance when conditions improve", () => {
    const poor = computeTrainingSuccessChance({
      bond: 5,
      energy: 15,
      hunger: 90,
      thirst: 90,
      happiness: 10,
      focus: 10,
      trust: 10,
      stress: 90,
      distraction: 90,
      trainingStreak: 0,
      lastTrainingSuccess: false,
      environment: "busy",
      difficulty: "hard",
    });

    const strong = computeTrainingSuccessChance({
      bond: 95,
      energy: 90,
      hunger: 20,
      thirst: 20,
      happiness: 95,
      focus: 95,
      trust: 95,
      stress: 10,
      distraction: 10,
      trainingStreak: 6,
      lastTrainingSuccess: true,
      environment: "quiet",
      difficulty: "easy",
    });

    expect(strong).toBeGreaterThan(poor);
  });

  it("formats chance values as clamped percent", () => {
    expect(formatChancePercent(0.556)).toBe(56);
    expect(formatChancePercent(1.7)).toBe(100);
    expect(formatChancePercent(-0.5)).toBe(0);
  });

  it("derives difficulty buckets from dog state", () => {
    expect(
      computeTrainingDifficulty({
        bond: 98,
        focus: 95,
        trust: 90,
        stress: 5,
        distraction: 5,
      })
    ).toBe("easy");

    expect(
      computeTrainingDifficulty({
        bond: 5,
        focus: 10,
        trust: 10,
        stress: 95,
        distraction: 90,
      })
    ).toBe("hard");

    expect(
      computeTrainingDifficulty({
        bond: 55,
        focus: 50,
        trust: 50,
        stress: 35,
        distraction: 30,
      })
    ).toBe("normal");
  });

  it("uses rng deterministically for outcome checks", () => {
    expect(computeTrainingOutcome({ chance: 0.5, rng: () => 0.5 })).toBe(true);
    expect(computeTrainingOutcome({ chance: 0.5, rng: () => 0.50001 })).toBe(
      false
    );
  });
});
