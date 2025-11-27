// src/components/EnhancedDogSprite.jsx
// @ts-nocheck

import React, { useMemo, useEffect, useState, useRef, useId } from "react";
import useDogAnimation from "@/features/game/hooks/useDogAnimation.jsx";
import useSpriteLoader from "@/features/game/hooks/useSpriteLoader.jsx";
import SpriteCanvas from "@/features/game/components/SpriteCanvas.jsx";
import SpriteOverlays from "@/features/game/components/SpriteOverlays.jsx";

/**
 * EnhancedDogSprite
 * CSS-background-based renderer for the Doggerz spritesheet.
 * Handles:
 * - 16x16 (or legacy 4x5) sheet
 * - life stage scaling
 * - cleanliness overlays + flea particles
 * Accessibility: Adds role and aria-label for screen readers
 */

export default function EnhancedDogSprite({ animateWag = false }) {
  const {
    spriteSrc,
    frameSize,
    cols,
    rows,
    // numeric frame info (added by useDogAnimation)
    frameIndex,
    frameX,
    frameY,
    scale,
    cleanlinessTier,
    currentAnimation, // for future debug/animation overlay
  } = useDogAnimation();

  const { imageLoaded, imageFailed, inferredStage, lqipDataUrl } =
    useSpriteLoader(spriteSrc, cleanlinessTier);

  // Accessibility: announce meaningful changes (stage/cleanliness/image availability)
  const id = useId();
  const liveId = `sprite-live-${id}`;
  const [announceText, setAnnounceText] = useState("");
  const prevStage = useRef(inferredStage);
  const prevClean = useRef(cleanlinessTier);

  useEffect(() => {
    const stageChanged = inferredStage !== prevStage.current;
    const cleanChanged = cleanlinessTier !== prevClean.current;
    if (stageChanged || cleanChanged || imageFailed) {
      const stageLabel = inferredStage
        ? inferredStage.charAt(0).toUpperCase() + inferredStage.slice(1)
        : "Dog";
      const cleanlinessLabel =
        cleanlinessTier && cleanlinessTier !== "FRESH"
          ? cleanlinessTier.toLowerCase()
          : "clean";
      const availability = imageFailed ? ", image unavailable" : "";
      setAnnounceText(`${stageLabel} dog, ${cleanlinessLabel}${availability}`);
      prevStage.current = inferredStage;
      prevClean.current = cleanlinessTier;
    }
  }, [inferredStage, cleanlinessTier, imageFailed]);

  // Sprite sheet calculations
  const baseSize = Math.round(frameSize * scale);
  const sheetWidth = frameSize * cols;
  const sheetHeight = frameSize * rows;
  const shadowWidth = baseSize * 0.7;
  const shadowHeight = baseSize * 0.18;

  // Precompute background CSS used for the sprite; expose for debug overlay
  const computedBackgroundSize = `${Math.round(sheetWidth * scale)}px ${Math.round(sheetHeight * scale)}px`;

  const computedBackgroundPosition = (() => {
    try {
      const fx = Math.round(frameX || 0);
      const fy = Math.round(frameY || 0);
      const px = -fx * frameSize * scale;
      const py = -fy * frameSize * scale;
      return `${Math.round(px)}px ${Math.round(py)}px`;
    } catch (e) {
      return "0px 0px";
    }
  })();

  return (
    <div
      className="relative flex flex-col items-center justify-end select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
      role="img"
      aria-label={
        imageFailed
          ? `Dog sprite (image unavailable)${cleanlinessTier !== "FRESH" ? `, ${cleanlinessTier.toLowerCase()}` : ""}`
          : `Dog sprite${cleanlinessTier !== "FRESH" ? ` (${cleanlinessTier.toLowerCase()})` : ""}`
      }
      aria-describedby={liveId}
      tabIndex={0}
    >
      <SpriteCanvas
        baseSize={baseSize}
        animateWag={animateWag}
        lqipDataUrl={lqipDataUrl}
        imageLoaded={imageLoaded}
        spriteSrc={spriteSrc}
        computedBackgroundSize={computedBackgroundSize}
        computedBackgroundPosition={computedBackgroundPosition}
        imageFailed={imageFailed}
      />

      <SpriteOverlays
        cleanlinessTier={cleanlinessTier}
        inferredStage={inferredStage}
        baseSize={baseSize}
      />

      {/* Announce changes for assistive tech */}
      <div id={liveId} className="sr-only" aria-live="polite">
        {announceText}
      </div>

      {/* Dev-only debug overlay: quick snapshot of sprite/frame CSS and values */}
      {import.meta.env && import.meta.env.DEV && (
        <div className="absolute top-2 right-2 z-50 pointer-events-none text-[11px] font-mono bg-black/60 text-white p-2 rounded max-w-[320px]">
          <div className="break-words">
            src: {spriteSrc ? spriteSrc.replace(/^.*[\\/]/, "") : "—"}
          </div>
          <div>
            frame: {frameIndex ?? "—"} ({frameX ?? 0},{frameY ?? 0})
          </div>
          <div>
            size: {frameSize}px cols:{cols} rows:{rows}
          </div>
          <div>bg-size: {computedBackgroundSize}</div>
          <div>bg-pos: {computedBackgroundPosition}</div>
          <div>
            render:{" "}
            {spriteSrc &&
            (spriteSrc.endsWith(".png") || spriteSrc.endsWith(".webp"))
              ? "pixelated"
              : "auto"}
          </div>
        </div>
      )}
    </div>
  );
}
