import { describe, it, expect } from "vitest";
import { deriveBaseAnimation, isOverrideExpired } from "../animationUtils.js";

const makeDog = (stats) => ({ stats });

describe("deriveBaseAnimation", () => {
  it("returns idle by default", () => {
    expect(deriveBaseAnimation(makeDog({}))).toBe("idle");
  });
  it("sleep when energy <20", () => {
    expect(deriveBaseAnimation(makeDog({ energy: 10 }))).toBe("sleep");
  });
  it("scratch when cleanliness <30 overrides happiness", () => {
    expect(
      deriveBaseAnimation(makeDog({ cleanliness: 25, happiness: 10 })),
    ).toBe("scratch");
  });
  it("sad when happiness <25", () => {
    expect(deriveBaseAnimation(makeDog({ happiness: 20 }))).toBe("sad");
  });
  it("excited when happiness >75", () => {
    expect(deriveBaseAnimation(makeDog({ happiness: 90 }))).toBe("excited");
  });
});

describe("isOverrideExpired", () => {
  it("true for null", () => {
    expect(isOverrideExpired(null, 1000)).toBe(true);
  });
  it("false when expiresAt > now", () => {
    expect(isOverrideExpired({ name: "eat", expiresAt: 2000 }, 1000)).toBe(
      false,
    );
  });
  it("true when expiresAt <= now", () => {
    expect(isOverrideExpired({ name: "eat", expiresAt: 1000 }, 1000)).toBe(
      true,
    );
  });
});
