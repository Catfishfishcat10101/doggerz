// src/utils/getSpriteForLifeStage.js
/**
 * Returns the sprite sheet path for a given life stage.
 * @param {string} stageId - "PUPPY" | "ADULT" | "SENIOR"
 * @returns {string} Sprite sheet path
 */
import puppyHdSvg from "@/assets/sprites/jackrussell/jack_russell_puppy_hd.svg";
import puppySvg from "@/assets/sprites/jackrussell/jack_russell_puppy.svg";
import puppy from "@/assets/sprites/jackrussell/jack_russell_puppy.png";
import adultSvg from "@/assets/sprites/jackrussell/jack_russell_adult.svg";
import adult from "@/assets/sprites/jackrussell/jack_russell_adult.png";
import seniorHdSvg from "@/assets/sprites/jackrussell/jack_russell_senior_hd.svg";
import seniorSvg from "@/assets/sprites/jackrussell/jack_russell_senior.svg";
import senior from "@/assets/sprites/jackrussell/jack_russell_senior.png";

/**
 * Returns the bundled sprite sheet URL for a given life stage.
 * Uses imported assets so the Vite bundler resolves hashed URLs.
 */
export function getSpriteForLifeStage(stageId, cleanliness = "FRESH") {
  // Normalize stage
  const stage = (stageId || "PUPPY").toUpperCase();

  const preferWebp = Boolean(
    import.meta.env &&
      (import.meta.env.VITE_PREFER_WEBP === "1" ||
        import.meta.env.PREFER_WEBP === "1"),
  );
  const makeWebp = (name) => {
    try {
      return new URL(
        `../../../assets/sprites/jackrussell/${name}.webp`,
        import.meta.url,
      ).href;
    } catch (e) {
      return null;
    }
  };

  // prefer HD SVG -> SVG -> PNG for fresh sheets; cleanliness variants remain PNG
  switch (stage) {
    case "PUPPY": {
      const stageKey = "puppy";
      if (cleanliness === "FRESH") {
        if (preferWebp) {
          const wp = makeWebp(`jack_russell_${stageKey}`);
          if (wp) return wp;
        }
        return puppyHdSvg || puppySvg || puppy;
      }
      // cleanliness variants are provided as PNG files in the atlas; prefer webp sibling if enabled
      if (preferWebp) {
        const wp = makeWebp(
          `jack_russell_${stageKey}_` + (cleanliness || "").toLowerCase(),
        );
        if (wp) return wp;
      }
      return puppy;
    }
    case "ADULT": {
      const stageKey = "adult";
      if (cleanliness === "FRESH") {
        if (preferWebp) {
          const wp = makeWebp(`jack_russell_${stageKey}`);
          if (wp) return wp;
        }
        return adultSvg || adult;
      }
      if (preferWebp) {
        const wp = makeWebp(
          `jack_russell_${stageKey}_` + (cleanliness || "").toLowerCase(),
        );
        if (wp) return wp;
      }
      return adult;
    }
    case "SENIOR":
    default: {
      const stageKey = "senior";
      if (cleanliness === "FRESH") {
        if (preferWebp) {
          const wp = makeWebp(`jack_russell_${stageKey}`);
          if (wp) return wp;
        }
        return seniorHdSvg || seniorSvg || senior;
      }
      if (preferWebp) {
        const wp = makeWebp(
          `jack_russell_${stageKey}_` + (cleanliness || "").toLowerCase(),
        );
        if (wp) return wp;
      }
      return senior;
    }
  }
}
