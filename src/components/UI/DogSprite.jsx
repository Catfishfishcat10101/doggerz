// src/components/UI/DogSprite.jsx
import React, { useEffect, useMemo, useRef } from "react";
import dogSheet from "../../assets/sprites/dog_sheet.png"; // 4 rows x N columns

/**
 * Props:
 * - size: rendered box size (px)
 * - frameWidth/frameHeight: per-frame pixels in the sheet
 * - direction: "down" | "right" | "up" | "left"
 * - isWalking: boolean
 * - frameCount: integer (columns)
 * - frameRate: frames per second
 * - spriteUrl: override the sheet image
 */
export default function DogSprite({
  size = 64,
  frameWidth = 64,
  frameHeight = 64,
  direction = "down",
  isWalking = false,
  frameCount = 4,
  frameRate = 8,
  spriteUrl = dogSheet,
}) {
  const rowIndex = useMemo(() => {
    switch (direction) {
      case "right":
        return 1;
      case "up":
        return 2;
      case "left":
        return 3;
      case "down":
      default:
        return 0;
    }
  }, [direction]);

  const animRef = useRef(null);

  useEffect(() => {
    if (!animRef.current) return;

    const el = animRef.current;
    const ms = 1000 / Math.max(1, frameRate);
    el.style.setProperty("--dog-steps", frameCount);
    el.style.setProperty("--dog-ms", `${ms}ms`);
    el.style.animationPlayState = isWalking ? "running" : "paused";
  }, [frameRate, frameCount, isWalking]);

  const style = {
    width: size,
    height: size,
    imageRendering: "pixelated",
    backgroundImage: `url(${spriteUrl})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${frameWidth * frameCount}px ${frameHeight * 4}px`,
    backgroundPosition: `0px ${-rowIndex * frameHeight}px`,
    // mask to square just in case
    overflow: "hidden",
  };

  return (
    <div
      ref={animRef}
      style={style}
      className="dog-sprite"
      aria-label={`Dog facing ${direction}${isWalking ? " walking" : ""}`}
    />
  );
}
