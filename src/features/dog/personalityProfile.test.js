// src/features/dog/personalityProfile.test.js
import { describe, expect, it } from "vitest";

import { derivePersonalityProfile } from "@/features/dog/personalityProfile.js";

describe("personalityProfile", () => {
  it("returns the cleaned logic stack fields alongside compatibility fields", () => {
    const profile = derivePersonalityProfile({
      bond: { value: 72 },
      stats: {
        hunger: 22,
        thirst: 18,
        energy: 64,
        cleanliness: 75,
        health: 84,
        happiness: 70,
        affection: 68,
        mentalStimulation: 61,
      },
      potty: { training: 58 },
      personality: {
        traits: {
          adventurous: 20,
          social: 15,
          energetic: 25,
          playful: 30,
          affectionate: 18,
        },
      },
      skills: {
        obedience: {
          sit: { level: 5 },
          speak: { level: 4 },
        },
      },
      training: {
        adult: { streak: 3 },
      },
    });

    expect(profile.temperament).toEqual(
      expect.objectContaining({
        socialDrive: expect.any(Number),
        energy: expect.any(Number),
        inquisitiveness: expect.any(Number),
      })
    );
    expect(profile.corePersonality).toEqual(
      expect.objectContaining({
        openness: expect.any(Number),
        conscientiousness: expect.any(Number),
        neuroticism: expect.any(Number),
        agreeableness: expect.any(Number),
        extroversion: expect.any(Number),
      })
    );
    expect(profile.dynamicState).toEqual(
      expect.objectContaining({
        frustration: expect.any(Number),
        confidence: expect.any(Number),
        affection: 68,
        anxiety: expect.any(Number),
        focus: expect.any(Number),
      })
    );
    expect(profile.learnedTraits).toEqual(
      expect.objectContaining({
        obedienceReliability: expect.any(Number),
        houseManners: 58,
        pottyTraining: 58,
      })
    );
    expect(profile.bigFive).toEqual(profile.corePersonality);
    expect(profile.dynamicStates.focus).toBe(profile.dynamicState.focus);
  });
});
