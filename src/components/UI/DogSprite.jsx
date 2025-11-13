import React, { useEffect, useState } from "react";
import jackSprite from "@/assets/sprites/jack_russell_directions.png";

/**
 * DogSprite
 * -----------------------------------------------
 * Handles:
 * - Directional sprite selection (left/right/front/back)
 * - Animation stepping between frame 0 and 1
 * - Pixel-perfect crisp rendering
 *
 * Directions recognized:
 * "left", "right", "down", "up"
 */

const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;

const SPRITE_MAP = {
  left: 0,   // row 0
  right: 1,  // row 1
  down: 2,   // row 2
  up: 3,     // row 3 (your sheet has 1 frame, but this engine supports 2)
};

export default function DogSprite({ direction = "down", speed = 300 }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    // simple 2-frame flip animation
    const id = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, speed);

    return () => clearInterval(id);
  }, [speed]);

  const row = SPRITE_MAP[direction] ?? 0;
  const col = frame;

  const offsetX = -col * FRAME_WIDTH;
  const offsetY = -row * FRAME_HEIGHT;

  return (
    <div
      className="w-16 h-16 bg-no-repeat image-render-pixel"
      style={{
        backgroundImage: `url(${jackSprite})`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        width: FRAME_WIDTH,
        height: FRAME_HEIGHT,
      }}
    />
  );
}
