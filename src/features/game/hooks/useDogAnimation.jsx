import { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  selectDogLifeStage,
  selectDogCleanlinessTier,
} from "@/redux/dogSlice.js";
import { getSpriteForLifeStage } from "@/utils/getSpriteForLifeStage.js";
import { IDLE_ANIM } from "@/constants/animation.js";

// Map cleanliness tier to filename suffix
const CLEANLINESS_SUFFIX = {
  FRESH: "",
  DIRTY: "_dirty",
  FLEAS: "_fleas",
  MANGE: "_mange",
};

export default function useDogAnimation() {
  const lifeStage = useSelector(selectDogLifeStage);
  const cleanlinessTier = useSelector(selectDogCleanlinessTier);

  const lifeStageKey = (
    lifeStage?.lifeStage ||
    lifeStage?.stage ||
    "PUPPY"
  ).toUpperCase();

  // Use the canonical bundle-resolved helper which already prefers HD/SVG -> PNG
  // and accepts a cleanliness tier.
  const finalSpriteSrc = useMemo(() => {
    try {
      return getSpriteForLifeStage(lifeStageKey || "PUPPY", cleanlinessTier);
    } catch (e) {
      return "";
    }
  }, [lifeStageKey, cleanlinessTier]);

  // Preload the resolved sprite (simple single-attempt preload). We'll add
  // retries/backoff in the next step.
  const [resolvedSprite, setResolvedSprite] = useState(finalSpriteSrc || "");
  useEffect(() => {
    if (!finalSpriteSrc) {
      setResolvedSprite("");
      return undefined;
    }

    let mounted = true;

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // Attempts = initial attempt + 2 retries => maxAttempts = 3
    const maxRetries = 2;
    const baseDelay = 200; // ms

    async function tryLoadWithRetries(url) {
      let attempt = 0;
      let lastErr = null;

      while (attempt <= maxRetries && mounted) {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve();
            img.onerror = (e) => reject(e || new Error("img load error"));
            img.src = url;
          });
          return url;
        } catch (err) {
          lastErr = err;
          attempt += 1;
          if (attempt <= maxRetries && mounted) {
            const delay = baseDelay * Math.pow(3, attempt - 1); // 200ms, 600ms
            // DEV trace
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.debug(
                `useDogAnimation: preload attempt ${attempt} failed for ${url}, retrying in ${delay}ms`,
                err,
              );
            }
            // wait before retrying
            // eslint-disable-next-line no-await-in-loop
            await sleep(delay);
          }
        }
      }

      throw lastErr || new Error("failed to load image");
    }

    let cancelled = false;
    (async () => {
      try {
        // Primary attempt: try the chosen asset (could be SVG or PNG)
        const loaded = await tryLoadWithRetries(finalSpriteSrc);
        if (!mounted || cancelled) return;
        setResolvedSprite(loaded || finalSpriteSrc);
        return;
      } catch (primaryErr) {
        // If primary was an SVG, try PNG fallback for same stage/cleanliness.
        if (!mounted || cancelled) return;
        if (
          typeof finalSpriteSrc === "string" &&
          finalSpriteSrc.endsWith(".svg")
        ) {
          try {
            // Build a bundled PNG fallback URL using the assets folder naming.
            const stageKey = (lifeStageKey || "PUPPY").toLowerCase();
            const suffix = CLEANLINESS_SUFFIX[cleanlinessTier] || "";
            const pngUrl = new URL(
              `../../../assets/sprites/jackrussell/jack_russell_${stageKey}${suffix}.png`,
              import.meta.url,
            ).href;
            const loadedPng = await tryLoadWithRetries(pngUrl);
            if (!mounted || cancelled) return;
            setResolvedSprite(loadedPng);
            return;
          } catch (pngErr) {
            if (import.meta.env.DEV) {
              // eslint-disable-next-line no-console
              console.debug(
                "useDogAnimation: svg primary and png fallback both failed",
                { primaryErr, pngErr },
              );
            }
          }
        }

        // Final: clear resolvedSprite (UI can fall back to blank or placeholder)
        if (mounted && !cancelled) setResolvedSprite("");
      }
    })();

    return () => {
      mounted = false;
      cancelled = true;
    };
  }, [finalSpriteSrc, lifeStageKey, cleanlinessTier]);

  // Debug: log resolved sprite path to help diagnose runtime loading issues.
  // DEV logging: show which asset was chosen and its type.
  if (import.meta.env.DEV && typeof window !== "undefined") {
    try {
      const isSvg = finalSpriteSrc && finalSpriteSrc.endsWith(".svg");
      // eslint-disable-next-line no-console
      console.debug("useDogAnimation: finalSpriteSrc", {
        src: finalSpriteSrc,
        isSvg,
        lifeStage: lifeStageKey,
        cleanliness: cleanlinessTier,
        resolvedSpritePresent: !!resolvedSprite,
      });
    } catch (err) {
      // ignore
    }
  }

  // Frame/grid assumptions: sheets use 128px frames, 16x16 grid in source spec.
  const frameSize = 128;
  const cols = 16;
  const rows = 16;
  const scale = 1.25; // slightly larger for better visibility

  // Simple idle animation: configurable per life stage via `IDLE_ANIM`.
  const [frameIndex, setFrameIndex] = useState(0);
  useEffect(() => {
    if (!finalSpriteSrc) return undefined;

    // Determine per-stage idle configuration (fall back to default)
    const stageKey = (lifeStageKey || "PUPPY").toLowerCase();
    const cfg = IDLE_ANIM[stageKey] || IDLE_ANIM.default;
    const { start = 0, frames = 4, interval = 350 } = cfg;

    // Reset to starting frame for this stage when sprite changes
    setFrameIndex(start);

    // Cycle through the configured frame window
    const id = setInterval(() => {
      setFrameIndex((i) => {
        const next = i + 1;
        // Wrap within [start, start+frames)
        const rel = (next - start) % frames;
        return start + (rel < 0 ? rel + frames : rel);
      });
    }, interval);

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug("useDogAnimation: idle config", { stageKey, cfg });
    }

    return () => clearInterval(id);
  }, [finalSpriteSrc, lifeStageKey]);

  const frameX = frameIndex % cols;
  const frameY = Math.floor(frameIndex / cols);
  // Do not compute pixel-string backgroundPosition here; return numeric frameIndex
  // so the renderer can compute scaled positions precisely.

  return {
    spriteSrc: resolvedSprite || finalSpriteSrc,
    frameSize,
    cols,
    rows,
    frameIndex,
    frameX,
    frameY,
    scale,
    cleanlinessTier,
    currentAnimation: "idle",
  };
}
