// src/components/UI/DogSprite.jsx
import React, { memo } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import dogSprite from "../../assets/sprites/jack_russell_directions.png";

const SPRITE_DIRECTIONS = { down: 0, left: 1, right: 2, up: 3 };

function DogSprite({
  x = 96,
  y = 96,
  direction = "down",
  isWalking = false,
  isDirty = false,
  isBathing = false,
  isHappy = false,
  frameCount = 4,
  frameRate = 8,
  idleFrame = 0,
  size = 96
}) {
  const row = SPRITE_DIRECTIONS[direction] ?? 0;
  const col = isWalking ? Math.floor((Date.now() / (1000 / frameRate)) % frameCount) : idleFrame;

  return (
    <div
      className={classNames("absolute transition-transform", {
        "grayscale": isDirty && !isBathing,
        "animate-pulse": isHappy
      })}
      style={{ left: x, top: y, width: size, height: size, imageRendering: "pixelated" }}
      aria-label="Dog sprite"
      role="img"
    >
      <div
        style={{
          width: size,
          height: size,
          backgroundImage: `url(${dogSprite})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${frameCount * 100}% ${4 * 100}%`,
          backgroundPosition: `${(-col * 100) / (frameCount - 1)}% ${(-row * 100) / (4 - 1)}%`
        }}
      />
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
  size: PropTypes.number
};

export default memo(DogSprite);