// src/components/DogSprite.jsx
// @ts-nocheck

import React, { useEffect, useRef, useState } from "react";
import dogSpriteSheet from "@/assets/sprites/doggerz_full_2048.png";

// 2048 / 16 = 128
const FRAME_SIZE = 128;
const DEFAULT_SCALE = 2;

// Default FPS if animation meta doesn't override
const DEFAULT_FPS = 8;

// Animation → row, start frame, frame count, fps
// You can tweak these ranges if some frames look bad.
const ANIM_META = {
  idle: { row: 0, start: 0, frames: 4, fps: 6 },   // small breathing loop
  walk: { row: 1, start: 0, frames: 8, fps: 10 },
  run: { row: 2, start: 0, frames: 8, fps: 12 },
  sit: { row: 3, start: 0, frames: 4, fps: 6 },
  lay: { row: 4, start: 0, frames: 4, fps: 6 },
  eat: { row: 5, start: 0, frames: 6, fps: 10 },
  playBall: { row: 6, start: 0, frames: 8, fps: 10 },
  playTug: { row: 7, start: 0, frames: 8, fps: 10 },
  sleep: { row: 8, start: 0, frames: 4, fps: 4 },
  bark: { row: 9, start: 0, frames: 4, fps: 12 },
  scratch: { row: 10, start: 0, frames: 6, fps: 10 },
  shake: { row: 11, start: 0, frames: 6, fps: 14 },
  potty: { row: 12, start: 0, frames: 6, fps: 8 },
  sad: { row: 13, start: 0, frames: 4, fps: 6 },
  excited: { row: 14, start: 0, frames: 6, fps: 12 },
  special: { row: 15, start: 0, frames: 8, fps: 10 },
};

export default function DogSprite({
  animation = "idle",
  scale = DEFAULT_SCALE,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [frameIndex, setFrameIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Resolve meta for current animation
  const meta = ANIM_META[animation] ?? ANIM_META.idle;
  const totalFrames = Math.max(1, meta.frames || 1);
  const fps = meta.fps || DEFAULT_FPS;

  // Load the spritesheet once
  useEffect(() => {
    const img = new Image();
    img.src = dogSpriteSheet;
    img.onload = () => {
      imageRef.current = img;
      setIsLoaded(true);
      setHasError(false);
    };
    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
    };
    return () => {
      imageRef.current = null;
    };
  }, []);

  // Frame loop (per animation, uses its fps + frame count)
  useEffect(() => {
    if (!isLoaded || hasError) return;

    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % totalFrames);
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [isLoaded, hasError, totalFrames, fps, animation]);

  // Draw current frame
  useEffect(() => {
    if (!isLoaded || hasError) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;
    if (!canvas || !ctx || !img) return;

    const scaledSize = FRAME_SIZE * scale;
    const frameInSheet = meta.start + frameIndex; // 0..15 range within the row

    const sx = frameInSheet * FRAME_SIZE;
    const sy = meta.row * FRAME_SIZE;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      img,
      sx,
      sy,
      FRAME_SIZE,
      FRAME_SIZE,
      0,
      0,
      scaledSize,
      scaledSize
    );
  }, [frameIndex, animation, isLoaded, hasError, scale, meta]);

  const scaledSize = FRAME_SIZE * scale;

  if (hasError) {
    return (
      <div className="flex h-24 w-24 items-center justify-center rounded-lg border border-red-500/60 bg-red-950/70 text-[0.7rem] text-red-200 text-center px-2">
        Sprite load failed.
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={scaledSize}
      height={scaledSize}
      style={{ imageRendering: "pixelated" }}
      className="block"
    />
  );
}
export { DogSprite };