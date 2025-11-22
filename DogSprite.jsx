// src/components/DogSprite.jsx
// @ts-nocheck

import React, { useEffect, useRef, useState } from "react";
import dogSpriteSheet from "@/assets/sprites/doggerz_full_2048.png";

const SPRITE_SIZE = 128;
const DEFAULT_SCALE = 2;
const FPS = 8;
const FRAMES_PER_ROW = 16;

const ANIMATION_ROWS = {
  idle: 0,
  walk: 1,
  sleep: 8,
};

export default function DogSprite({
  animation = "idle",
  scale = DEFAULT_SCALE,
}) {
  const canvasRef = useRef(null);
  const imageRef = useRef(null);
  const [frame, setFrame] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

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

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % FRAMES_PER_ROW);
    }, 1000 / FPS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isLoaded || hasError) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const img = imageRef.current;
    if (!canvas || !ctx || !img) return;

    const rowIndex = ANIMATION_ROWS[animation] ?? ANIMATION_ROWS.idle;
    const sx = frame * SPRITE_SIZE;
    const sy = rowIndex * SPRITE_SIZE;
    const scaledSize = SPRITE_SIZE * scale;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      img,
      sx,
      sy,
      SPRITE_SIZE,
      SPRITE_SIZE,
      0,
      0,
      scaledSize,
      scaledSize
    );
  }, [frame, animation, isLoaded, hasError, scale]);

  const scaledSize = SPRITE_SIZE * scale;

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
