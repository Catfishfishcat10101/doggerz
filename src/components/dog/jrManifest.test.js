import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  findJrSpriteSheetBySrc,
  getJrSpriteFramePosition,
  getJrSpriteSheet,
} from "@/components/dog/jrManifest.js";
import { MASTER_TRICKS } from "@/logic/obedienceCommands.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spriteRoot = path.resolve(__dirname, "../../../public/assets/sprites/jr");

describe("jrManifest", () => {
  it("maps adult interact to the bark sheet with correct metadata", () => {
    const entry = getJrSpriteSheet("ADULT", "interact");

    expect(entry.stage).toBe("adult");
    expect(entry.action).toBe("bark");
    expect(entry.frames).toBe(6);
    expect(entry.columns).toBe(6);
    expect(entry.sheetWidth).toBe(1536);
    expect(entry.url).toContain("/assets/sprites/jr/adult_bark.png");
  });

  it("falls senior stage back to adult sheets", () => {
    const entry = getJrSpriteSheet("SENIOR", "sleep");

    expect(entry.stage).toBe("senior");
    expect(entry.action).toBe("idle");
    expect(entry.rows).toBeGreaterThanOrEqual(1);
  });

  it("can recover manifest metadata from an already-loaded sprite URL", () => {
    const entry = findJrSpriteSheetBySrc(
      "https://doggerz.test/assets/sprites/jr/pup_idle.png?v=123",
      "adult",
      "walk"
    );

    expect(entry.stage).toBe("pup");
    expect(entry.action).toBe("idle");
    expect(entry.frames).toBe(16);
    expect(entry.rows).toBe(2);
  });

  it("calculates exact background positions for multi-row sheets", () => {
    const entry = getJrSpriteSheet("PUPPY", "idle");
    const frame0 = getJrSpriteFramePosition(entry, 0);
    const frame7 = getJrSpriteFramePosition(entry, 7);
    const frame8 = getJrSpriteFramePosition(entry, 8);

    expect(frame0).toMatchObject({ col: 0, row: 0, x: 0, y: 0 });
    expect(frame7).toMatchObject({ col: 7, row: 0, x: -1792, y: 0 });
    expect(frame8).toMatchObject({ col: 0, row: 1, x: 0, y: -256 });
  });

  it("has puppy and adult sprite strips for every master trick", () => {
    for (const trick of MASTER_TRICKS) {
      const animKey = String(trick?.animationKey || "").trim();
      expect(animKey).not.toBe("");

      const puppyStrip = path.join(spriteRoot, `pup_${animKey}.png`);
      const adultStrip = path.join(spriteRoot, `adult_${animKey}.png`);

      expect(
        fs.existsSync(puppyStrip),
        `Missing ${path.basename(puppyStrip)}`
      ).toBe(true);
      expect(
        fs.existsSync(adultStrip),
        `Missing ${path.basename(adultStrip)}`
      ).toBe(true);
    }
  });
});
