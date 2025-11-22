// src/components/EnhancedDogSprite.jsx
// @ts-nocheck

import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import { getCleanlinessEffects } from "@/constants/game.js";

// IMPORTANT: file must live at public/sprites/doggerz_full_2048.png
const SPRITESHEET_URL = "/sprites/doggerz_full_2048.png";

// 2048x2048 sheet, 16x16 grid, 128px frames
const FRAME_SIZE = 128;
const FRAMES_PER_ROW = 16;
const SHEET_SIZE = FRAME_SIZE * FRAMES_PER_ROW;

const ANIMATIONS = {
  idle: { row: 0, fps: 8 },
  walk: { row: 1, fps: 12 },
  run: { row: 2, fps: 12 },
  sit: { row: 3, fps: 10 },
  lay: { row: 4, fps: 8 },
  eat: { row: 5, fps: 10 },
  play: { row: 6, fps: 10 },
  playTug: { row: 7, fps: 10 },
  sleep: { row: 8, fps: 8 },
  bark: { row: 9, fps: 15 },
  scratch: { row: 10, fps: 12 },
  shake: { row: 11, fps: 15 },
  potty: { row: 12, fps: 10 },
  sad: { row: 13, fps: 8 },
  excited: { row: 14, fps: 12 },
  special: { row: 15, fps: 12 },
};

const DEFAULT_ANIM = ANIMATIONS.idle;
const DEFAULT_SCALE = 2;

export default function EnhancedDogSprite({
  animation = "idle",
  scale = DEFAULT_SCALE,
  showCleanlinessOverlay = true,
  reducedMotion = false,
}) {
  const storeDog = useSelector(selectDog);

  // Fallback dog so Splash/Landing still show something
  const dog = storeDog || {
    name: "Your pup",
    adoptedAtMs: Date.now(),
    stats: { cleanliness: 100 },
  };

  const [frameIndex, setFrameIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  const animMeta = ANIMATIONS[animation] || DEFAULT_ANIM;
  const fps = Math.max(1, animMeta.fps || 8);
  const row = animMeta.row ?? 0;

  // Preload spritesheet from public URL
  useEffect(() => {
    const img = new Image();
    imgRef.current = img;

    img.onload = () => {
      setIsLoaded(true);
      setHasError(false);
    };
    img.onerror = () => {
      setIsLoaded(true);
      setHasError(true);
    };

    img.src = SPRITESHEET_URL;

    return () => {
      imgRef.current = null;
    };
  }, []);

  // Frame loop
  useEffect(() => {
    if (reducedMotion) {
      setFrameIndex(0);
      return;
    }

    // reset on animation change
    setFrameIndex(0);

    const delay = Math.round(1000 / fps);
    const id = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % FRAMES_PER_ROW);
    }, delay);

    return () => clearInterval(id);
  }, [animation, fps, reducedMotion]);

  if (hasError) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-red-500/60 bg-red-950/70 text-[0.7rem] text-red-200 text-center px-2">
        Sprite load
        <br />
        failed.
        <br />
        Check <code>public/sprites/doggerz_full_2048.png</code>.
      </div>
    );
  }

  const cleanliness = Math.round(dog?.stats?.cleanliness ?? 100);
  const cleanlinessEffects = getCleanlinessEffects(cleanliness);
  const tier = cleanlinessEffects.tier;

  const overlayTint =
    tier === "DIRTY"
      ? "rgba(120,72,24,0.18)"
      : tier === "FLEAS"
        ? "rgba(100,60,20,0.28)"
        : tier === "MANGE"
          ? "rgba(128,32,32,0.35)"
          : null;

  const safeScale = Number.isFinite(scale) && scale > 0 ? scale : DEFAULT_SCALE;

  const displayWidth = FRAME_SIZE * safeScale;
  const displayHeight = FRAME_SIZE * safeScale;
  const sheetWidth = SHEET_SIZE * safeScale;
  const sheetHeight = SHEET_SIZE * safeScale;

  return (
    <div
      className="relative overflow-hidden rounded-xl bg-zinc-900/80 shadow-lg border border-zinc-700/70"
      style={{ width: displayWidth, height: displayHeight }}
    >
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-[0.7rem] text-zinc-500">
          Loading…
        </div>
      )}

      <div
        aria-label={dog.name || "Your pup"}
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${SPRITESHEET_URL})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
          backgroundPosition: `-${frameIndex * displayWidth}px -${
            row * displayHeight
          }px`,
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
