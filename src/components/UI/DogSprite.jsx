// src/components/UI/DogSprite.jsx
import React, { memo, useMemo } from "react";
import useSpriteAnimator from "../../hooks/useSpriteAnimator";
import "./DogSprite.css";
import spritePng from "../../assets/sprites/jack_russell_directions.png";

/**
 * Directions are rows: 0=down,1=left,2=right,3=up
 */
const DIR_ROW = { down: 0, left: 1, right: 2, up: 3 };

function DogSprite({
  size = 96,
  direction = "down",
  isWalking = false,
  frameWidth = 64,
  frameHeight = 64,
  frameCount = 4,
  frameRate = 8,
  idleFrame = 0,
}) {
  const dirRow = DIR_ROW[direction] ?? 0;

  const { frame, getBackgroundPosition } = useSpriteAnimator({
    isPlaying: isWalking,
    frameCount,
    frameRate,
    idleFrame,
  });

  const style = useMemo(() => {
    return {
      width: `${size}px`,
      height: `${size}px`,
      backgroundImage: `url(${spritePng})`,
      backgroundRepeat: "no-repeat",
      ...getBackgroundPosition({ frameWidth, frameHeight, directionRow: dirRow }),
      backgroundSize: "auto", // each tile is fixed frameWidth/height in the sheet
      imageRendering: "pixelated",
    };
  }, [size, frameWidth, frameHeight, dirRow, getBackgroundPosition]);

  return (
    <div
      className="dog-sprite select-none"
      aria-label={`dog facing ${direction} frame ${frame}`}
      style={style}
    />
  );
}

export default memo(DogSprite);
