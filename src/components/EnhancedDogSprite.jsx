// src/components/EnhancedDogSprite.jsx
// @ts-nocheck

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import { getCleanlinessEffects } from "@/constants/game.js";

import { calculateDogAge, getSpriteForLifeStage } from "@/utils/lifecycle.js";
import { getAnimationMeta, nextFrame } from "@/features/game/DogAnimator.js";

export default function EnhancedDogSprite({ animation = "idle", scale, showCleanlinessOverlay = true, reducedMotion = false }) {
  const dog = useSelector(selectDog);

  const [frameIndex, setFrameIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  if (!dog) {
    return (
      <p className="text-xs text-zinc-400">
        No pup yet. Adopt one to bring this area to life.
      </p>
    );
  }

  // Use adoptedAtMs per slice; fall back to createdAt if present
  const adoptedAt = dog.adoptedAtMs ?? dog.createdAt ?? null;
  const ageInfo = adoptedAt ? calculateDogAge(adoptedAt) : null;
  const stageId = ageInfo?.stageId ?? "PUPPY";

  // Sprite sheet path derived from life stage
  const spriteSrc = getSpriteForLifeStage(stageId);

  // Animation metadata (frame size, row, frames, fps)
  const meta = useMemo(() => getAnimationMeta(animation), [animation]);

  // Preload image to detect load/error reliably (background-image doesn't fire onLoad on element)
  useEffect(() => {
    if (!spriteSrc) {
      setHasError(true);
      setIsLoaded(true);
      return;
    }
    setIsLoaded(false);
    setHasError(false);
    const img = new Image();
    imgRef.current = img;
    img.onload = () => {
      setIsLoaded(true);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(true);
    };
    img.src = spriteSrc;
    return () => {
      // Break reference for GC
      imgRef.current = null;
    };
  }, [spriteSrc]);

  // Frame loop using animation FPS (respect reduced motion)
  useEffect(() => {
    if (reducedMotion) {
      setFrameIndex(0);
      return;
    }
    const fps = Math.max(1, Number(meta.fps || 6));
    const delay = Math.round(1000 / fps);
    const id = setInterval(() => {
      setFrameIndex((prev) => nextFrame(animation, prev));
    }, delay);
    return () => clearInterval(id);
  }, [animation, meta.fps, reducedMotion]);

  if (!spriteSrc || hasError) {
    return (
      <div className="w-24 h-24 flex items-center justify-center rounded-xl bg-zinc-900/80 border border-red-500/40 text-[0.7rem] text-red-300 text-center px-2">
        Sprite load failed. Check PNGs in <code>/public/sprites</code>.
      </div>
    );
  }

  const cleanliness = Math.round(dog?.stats?.cleanliness ?? 100);
  const cleanlinessEffects = getCleanlinessEffects(cleanliness);
  const tier = cleanlinessEffects.tier;

  const overlayTint = tier === "DIRTY"
    ? "rgba(120,72,24,0.18)"
    : tier === "FLEAS"
      ? "rgba(100,60,20,0.28)"
      : tier === "MANGE"
        ? "rgba(128,32,32,0.35)"
        : null;

  const stageScale = stageId === "PUPPY" ? 0.8 : stageId === "SENIOR" ? 0.9 : 1.0;
  const baseScale = 2; // per spec: render at 2x for clarity
  const computedScale = baseScale * stageScale;
  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : computedScale;
  const displayWidth = meta.frameWidth * safeScale;
  const displayHeight = meta.frameHeight * safeScale;
  const displaySheetWidth = meta.sheetWidth * safeScale;
  const displaySheetHeight = meta.sheetHeight * safeScale;

  return (
    <div className="relative overflow-hidden rounded-xl bg-zinc-900/80 shadow-lg border border-zinc-700/70"
      style={{ width: displayWidth, height: displayHeight }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[0.7rem] text-zinc-500">Loading…</div>
      )}

      {/* Use background-position to select a cell in the sheet grid */}
      <div
        aria-label={dog.name || "Your pup"}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${spriteSrc})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${displaySheetWidth}px ${displaySheetHeight}px`,
          backgroundPosition: `-${frameIndex * displayWidth}px -${meta.row * displayHeight}px`,
          imageRendering: "pixelated",
        }}
      />

      {showCleanlinessOverlay && overlayTint && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: overlayTint, mixBlendMode: "multiply" }}
        />
      )}
    </div>
  );
}

EnhancedDogSprite.displayName = "EnhancedDogSprite";
EnhancedDogSprite.framework = "react";
EnhancedDogSprite.group = "components";
EnhancedDogSprite.propagateFirebaseReady = false;
EnhancedDogSprite.propagateUser = false;
EnhancedDogSprite.propagateDog = false;
EnhancedDogSprite.defaultSize = { width: 256, height: 256 };
