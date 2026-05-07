// src/components/dog/manifests/jrManifest.test.js
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import {
  findJrSpriteSheetBySrc,
  getJrSpriteFramePosition,
  getJrSpriteSheet,
} from "@/components/dog/manifests/jrManifest.js";
import { MASTER_TRICKS } from "@/features/training/obedienceCommands.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const spriteRoot = path.resolve(
  __dirname,
  "../../../../public/assets/sprites/jr"
);

describe("jrManifest", () => {
  it("maps adult interact to the bark action while falling back to the puppy bark sheet", () => {
    const entry = getJrSpriteSheet("ADULT", "interact");

    expect(entry.stage).toBe("adult");
    expect(entry.action).toBe("bark");
    expect(entry.frames).toBe(6);
    expect(entry.columns).toBe(6);
    expect(entry.sheetWidth).toBe(1536);
    expect(entry.url).toContain("/assets/sprites/jr/pup_bark.png");
  });

  it("keeps senior stage metadata while falling back to the authored puppy sheet set", () => {
    const entry = getJrSpriteSheet("SENIOR", "sleep");

    expect(entry.stage).toBe("senior");
    expect(entry.action).toBe("sleep");
    expect(entry.url).toContain("/assets/sprites/jr/pup_sleep.png");
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

  it("resolves every master trick to an existing current sprite sheet", () => {
    for (const trick of MASTER_TRICKS) {
      const animKey = String(trick?.animationKey || "").trim();
      expect(animKey).not.toBe("");

      const entry = getJrSpriteSheet("adult", animKey);
      const resolvedStrip = path.join(spriteRoot, entry.fileName);

      expect(entry.fileName.startsWith("pup_")).toBe(true);
      expect(
        fs.existsSync(resolvedStrip),
        `Missing ${path.basename(resolvedStrip)} for ${trick.id}`
      ).toBe(true);
    }
  });

  it("maps every authored puppy sprite strip to renderable manifest metadata", () => {
    const puppyFiles = fs
      .readdirSync(spriteRoot)
      .filter((fileName) => /^pup_.*\.png$/i.test(fileName))
      .sort();

    expect(puppyFiles.length).toBeGreaterThan(0);

    for (const fileName of puppyFiles) {
      const entry = findJrSpriteSheetBySrc(
        `https://doggerz.test/assets/sprites/jr/${fileName}`,
        "pup",
        "idle"
      );

      expect(entry.fileName, `Unmapped puppy strip: ${fileName}`).toBe(
        fileName
      );
      expect(entry.url).toContain(`/assets/sprites/jr/${fileName}`);
      expect(entry.frames).toBeGreaterThan(0);
      expect(entry.frameWidth).toBeGreaterThan(0);
      expect(entry.frameHeight).toBeGreaterThan(0);
    }
  });
});
