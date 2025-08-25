// src/components/UI/DogSprite.jsx
import React, { memo, useMemo } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import useSpriteAnimator from "./hooks/useSpriteAnimator";
import "./styles/DogSprite.css";

// Default sprite sheet: 4 rows (down, left, right, up) × N columns
// Your file: /assets/sprites/jack_russell_directions.png
import dogSprite from "../../assets/sprites/jack_russell_directions.png";

const SPRITE_DIRECTIONS = /** @type {const} */ ({
  down: 0,
  left: 1,
  right: 2,
  up: 3,
});

function DogSprite({
  x = 96,
  y = 96,
  direction = "down",
  isWalking = false,
  isDirty = false,
  isBathing = false,
  isHappy = false,
  frameCount = 4,       // number of columns in your sheet
  frameRate = 8,        // frames per second while walking
  idleFrame = 0,        // which column to show when idle
  size = 64,            // base pixel size per frame (sheet cell size)
  scale = 1,            // CSS scale multiplier
  centerAnchor = true,  // center the sprite on (x,y) instead of top-left
  flipLeftIfNoRow = false, // if you don't have a "left" row, flip "right"
}) {
  const row = SPRITE_DIRECTIONS[direction] ?? 0;

  // Compute which animation row/flip we should actually use
  const { useRow, flipX } = useMemo(() => {
    if (flipLeftIfNoRow && direction === "left") {
      // Use the "right" row but mirror it horizontally
      return { useRow: SPRITE_DIRECTIONS.right, flipX: true };
    }
    return { useRow: row, flipX: false };
  }, [direction, row, flipLeftIfNoRow]);

  // Current frame index for animation
  const frameIndex = useSpriteAnimator({
    isPlaying: isWalking,
    frameCount,
    frameRate,
    idleIndex: idleFrame,
  });

  // Background position for the sprite
  const bgX = -(frameIndex * size);       // column
  const bgY = -(useRow * size);           // row

  // Positioning
  const left = x;
  const top = y;

  return (
    <div
      className={classNames("dog-sprite", {
        "is-dirty": isDirty,
        "is-bathing": isBathing,
        "is-happy": isHappy,
        "is-walking": isWalking,
      })}
      style={{
        left,
        top,
        width: size,
        height: size,
        transform: `
          translate(${centerAnchor ? "-50%, -50%" : "0, 0"})
          scale(${flipX ? -scale : scale}, ${scale})
        `,
        transformOrigin: centerAnchor ? "center center" : "top left",
        backgroundImage: `url(${dogSprite})`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundSize: "auto", // each cell is exactly `size`, so original scaling
        imageRendering: "pixelated",
        zIndex: 10,
      }}
      aria-label="Dog sprite"
      role="img"
    >
      {/* soft drop shadow under the sprite */}
      <div className="dog-shadow" aria-hidden="true" />

      {/* optional bathing bubbles overlay */}
      {isBathing && <div className="bubbles" aria-hidden="true" />}

      {/* optional happy sparkle */}
      {isHappy && <div className="sparkle" aria-hidden="true" />}
    </div>
  );
}

DogSprite.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  direction: PropTypes.oneOf(["down", "left", "right", "up"]),
  isWalking: PropTypes.bool,
  isDirty: PropTypes.bool,
  isBathing: PropTypes.bool,
  isHappy: PropTypes.bool,
  frameCount: PropTypes.number,
  frameRate: PropTypes.number,
  idleFrame: PropTypes.number,
  size: PropTypes.number,
  scale: PropTypes.number,
  centerAnchor: PropTypes.bool,
  flipLeftIfNoRow: PropTypes.bool,
};

if (typeof walking === "boolean") {
  // If walking is a boolean, we can use it directly
  isWalking = walking;
}

export default memo(DogSprite);