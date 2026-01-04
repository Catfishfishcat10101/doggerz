// src/features/game/components/SpriteSheetDog.jsx
// Renders a sprite-strip (frames laid out horizontally) as an animated dog.
// Works with the generated pack in /public/sprites/anim/jrt/...
// @ts-nocheck

import * as React from "react";

import { getJrtPackForStage } from "@/features/game/sprites/jrtSpritePack.js";
import { loadJrtManifest } from "@/features/game/sprites/jrtSpriteManifest.js";
import { joinPublicPath, withBaseUrl } from "@/utils/assetUrl.js";

function clamp(n, lo, hi) {
  const x = Number(n);
  if (!Number.isFinite(x)) return lo;
  return Math.max(lo, Math.min(hi, x));
}

function useJrtManifest() {
  const [manifest, setManifest] = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    loadJrtManifest().then((m) => {
      if (cancelled) return;
      setManifest(m || null);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return manifest;
}

export default function SpriteSheetDog({
  stage = "PUPPY",
  anim = "idle", // idle | walk | sit | lay | eat | bark
  facing = 1, // 1 or -1
  size = 320,
  reduceMotion = false,
  fallbackSrc,
  className = "",
  onDebug,
}) {
  const manifest = useJrtManifest();

  const [sheetFailed, setSheetFailed] = React.useState(false);
  const [sheetLoaded, setSheetLoaded] = React.useState(false);
  const [sheetNatural, setSheetNatural] = React.useState(null);
  const [fallbackIndex, setFallbackIndex] = React.useState(0);
  React.useEffect(() => {
    // Reset failure state when switching animations or stages.
    setSheetFailed(false);
    setSheetLoaded(false);
    setSheetNatural(null);
    setFallbackIndex(0);
  }, [stage, anim]);

  const stageKey = String(stage || "PUPPY").toUpperCase();
  const manifestStage = manifest?.stages?.[stageKey];
  const manifestAnim =
    manifestStage?.anims?.[anim] || manifestStage?.anims?.idle;

  const pack = getJrtPackForStage(stage);

  // Prefer manifest (real, script-generated values). Fall back to the pack metadata
  // so the dog still renders even if the manifest request is delayed/blocked.
  const meta = manifestAnim || pack?.anims?.[anim] || pack?.anims?.idle || null;

  const frames = clamp(meta?.frames ?? 1, 1, 64);
  const fps = clamp(meta?.fps ?? 6, 1, 30);
  const durMs = Math.round((frames / fps) * 1000);

  const base = manifestStage?.base || pack.base;
  const sheetSrc = meta ? withBaseUrl(joinPublicPath(base, meta.file)) : null;

  // Preload the strip and validate it's actually a wide strip.
  // Rendering the strip as a background image avoids browser/CSS interactions
  // that can make the whole sheet appear "fit" into the square (grid/collage).
  React.useEffect(() => {
    if (!sheetSrc) return;

    let cancelled = false;
    const img = new Image();

    img.onload = () => {
      if (cancelled) return;
      const w = Number(img.naturalWidth || 0);
      const h = Number(img.naturalHeight || 0);
      const ratio = h > 0 ? w / h : 0;
      const minRatio = Math.max(1, frames * 0.8);

      setSheetNatural({ w, h, ratio: Number.isFinite(ratio) ? ratio : 0 });

      if (h > 0 && ratio > 0 && ratio < minRatio) {
        setSheetFailed(true);
        setSheetLoaded(false);
        try {
          console.warn(
            "[SpriteSheetDog] loaded image is not a strip; falling back:",
            {
              sheetSrc,
              frames,
              w,
              h,
              ratio,
              minRatio,
            }
          );
        } catch {
          // ignore
        }
        return;
      }

      setSheetLoaded(true);
    };

    img.onerror = () => {
      if (cancelled) return;
      setSheetFailed(true);
      setSheetLoaded(false);
      try {
        console.warn("[SpriteSheetDog] strip load failed:", sheetSrc);
      } catch {
        // ignore
      }
    };

    img.src = sheetSrc;

    return () => {
      cancelled = true;
    };
  }, [frames, sheetSrc]);

  const fallbackCandidates = React.useMemo(() => {
    const src = String(fallbackSrc || "").trim();
    if (!src) return [];

    const out = [src];

    // If the canonical stage sprites aren't present for some deploys,
    // try the older jack_russell_* variants (kept for compatibility).
    // (We only add these when it looks like the caller passed a jrt_* path.)
    try {
      const s = src.toLowerCase();
      if (s.includes("/sprites/jrt_puppy."))
        out.push(withBaseUrl("/sprites/jack_russell_puppy.webp"));
      if (s.includes("/sprites/jrt_adult."))
        out.push(withBaseUrl("/sprites/jack_russell_adult.webp"));
      if (s.includes("/sprites/jrt_senior."))
        out.push(withBaseUrl("/sprites/jack_russell_senior.webp"));
    } catch {
      // ignore
    }

    // If webp fails to decode/load, try a best-effort png path.
    if (src.toLowerCase().endsWith(".webp")) {
      out.push(src.slice(0, -".webp".length) + ".png");
    }

    // Final fallback: app icon so we never render nothing.
    out.push(withBaseUrl("/icons/doggerz-192.png"));
    return out;
  }, [fallbackSrc]);

  const effectiveFallbackSrc =
    fallbackCandidates[
      Math.min(fallbackIndex, Math.max(0, fallbackCandidates.length - 1))
    ] || null;

  React.useEffect(() => {
    if (typeof onDebug !== "function") return;
    try {
      onDebug({
        stage: stageKey,
        anim,
        sheetSrc,
        sheetFailed,
        sheetLoaded,
        sheetNatural,
        fallbackSrc: String(fallbackSrc || "") || null,
        effectiveFallbackSrc,
        fallbackIndex,
        frames,
        fps,
      });
    } catch {
      // ignore
    }
  }, [
    anim,
    effectiveFallbackSrc,
    fallbackIndex,
    fallbackSrc,
    fps,
    frames,
    onDebug,
    sheetFailed,
    sheetLoaded,
    sheetSrc,
    sheetNatural,
    stageKey,
  ]);

  // While the strip loads, keep the dog visible via fallback.
  if (!sheetSrc || sheetFailed || !sheetLoaded) {
    // Fallback: render the static sprite.
    return effectiveFallbackSrc ? (
      <img
        src={effectiveFallbackSrc}
        alt=""
        draggable={false}
        className={className}
        onError={() => {
          // Try the next candidate.
          setFallbackIndex((i) => i + 1);
          try {
            console.warn(
              "[SpriteSheetDog] fallback load failed:",
              effectiveFallbackSrc
            );
          } catch {
            // ignore
          }
        }}
        style={{
          width: size,
          height: size,
          maxWidth: "none",
          maxHeight: "none",
          display: "block",
          // Use contain so we never crop the sprite sheet into an empty-looking region.
          // (Some fallback sprites are sheets/collages, not a single centered dog.)
          objectFit: "contain",
          objectPosition: "50% 60%",
          transform: `scaleX(${facing})`,
          transformOrigin: "50% 100%",
        }}
      />
    ) : null;
  }

  // We animate the strip via background-position in pixels.
  // One frame is rendered into a size x size box.
  const pxSize = Math.max(1, Math.round(Number(size) || 320));
  // IMPORTANT:
  // Use -frames * frameWidth so each step lands on an exact frame boundary.
  // (Using -(frames-1) with steps(frames) produces fractional step sizes.)
  const toPx = -(frames * pxSize);
  const keyName = `dg-strip-${stageKey}-${anim}-${frames}-${pxSize}`;

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        transform: `scaleX(${facing})`,
        transformOrigin: "50% 100%",
      }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes ${keyName} {
          0% { background-position: 0px 60%; }
          100% { background-position: ${toPx}px 60%; }
        }
      `}</style>

      <div
        style={{
          width: pxSize,
          height: pxSize,
          backgroundImage: `url(${sheetSrc})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${frames * pxSize}px ${pxSize}px`,
          backgroundPosition: "0px 60%",
          animation: reduceMotion
            ? "none"
            : `${keyName} ${durMs}ms steps(${frames}) infinite`,
          willChange: reduceMotion ? undefined : "background-position",
        }}
      />
    </div>
  );
}
