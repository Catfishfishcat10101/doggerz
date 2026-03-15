import { describe, expect, it } from "vitest";

import { isValidCleanlinessTier } from "@/features/dog/cleanlinessEffects.js";

describe("cleanlinessEffects", () => {
  it("validates known cleanliness tiers case-insensitively", () => {
    expect(isValidCleanlinessTier("fresh")).toBe(true);
    expect(isValidCleanlinessTier("DIRTY")).toBe(true);
    expect(isValidCleanlinessTier("fleas")).toBe(true);
    expect(isValidCleanlinessTier("MANGE")).toBe(true);
  });

  it("rejects unknown cleanliness tiers", () => {
    expect(isValidCleanlinessTier("")).toBe(false);
    expect(isValidCleanlinessTier("muddy")).toBe(false);
    expect(isValidCleanlinessTier(null)).toBe(false);
  });
});
