// @ts-nocheck
import React, { useState, useCallback } from "react";
import JackRussellPuppySprite from "@/components/JackRussellPuppySprite.jsx";
import { getSpriteForStageAndTier } from "@/utils/lifecycle.js";
import { getAnimationMeta } from "./DogAnimator.js";

/**
 * EnhancedDogSprite — selects an appropriate sprite sheet for the dog's
 * life stage and renders it using the shared sprite renderer.
 *
 * This component composes the existing `JackRussellPuppySprite` implementation
 * with animation metadata from `DogAnimator.js` so animations match the
 * sheet layout.
 */
export default function EnhancedDogSprite({ stage, dog, className = "", animation = "idle", scale = 1 }) {
  // Determine the sprite source from the dog's stage or provided stage prop
  const spriteSrc = getSpriteForStageAndTier(dog || stage);

  const meta = getAnimationMeta(animation || "idle");

  // Compute columns/rows from sheet/frame sizes (meta provides these)
  const columns = Math.max(1, Math.floor((meta.sheetWidth || 256) / (meta.frameWidth || 64)));
  const rows = Math.max(1, Math.floor((meta.sheetHeight || 320) / (meta.frameHeight || 64)));

  const fps = meta.fps || 6;

  const [interactiveAnim, setInteractiveAnim] = useState(null);

  const currentAnimation = interactiveAnim || animation || 'idle';

  const handleActivate = useCallback(() => {
    // momentarily switch to attention animation
    setInteractiveAnim('attention');
    setTimeout(() => setInteractiveAnim(null), 1200);
  }, []);

  return (
    <div
      className={className}
      role="img"
      aria-label={`Dog sprite: ${String(dog?.name || currentAnimation)}`}
      tabIndex={0}
      onClick={handleActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleActivate();
        }
      }}
    >
      <JackRussellPuppySprite
        src={spriteSrc}
        columns={columns}
        rows={rows}
        fps={fps}
        scale={scale}
        animate={true}
        loop={true}
        animation={currentAnimation}
      />
    </div>
  );
}
