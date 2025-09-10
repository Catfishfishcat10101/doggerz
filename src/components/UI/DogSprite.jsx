import React, { memo, useMemo } from "react";
import useSpriteAnimator from "../../hooks/useSpriteAnimator";
import "./DogSprite.css";
import spritePng from "../../assets/sprites/jack_russell_directions.png";

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
    isPlaying: isWalking, frameCount, frameRate, idleFrame,
  });

  const style = useMemo(() => ({
    width: `${size}px`,
    height: `${size}px`,
    backgroundImage: `url(${spritePng})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "auto",
    imageRendering: "pixelated",
    ...getBackgroundPosition({ frameWidth, frameHeight, directionRow: dirRow }),
  }), [size, frameWidth, frameHeight, dirRow, getBackgroundPosition]);

  return <div className="dog-sprite select-none" aria-label={`dog ${direction} frame ${frame}`} style={style} />;
}
export default memo(DogSprite);
