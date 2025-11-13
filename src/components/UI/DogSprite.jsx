// src/components/UI/DogSprite.jsx
import React, { useEffect, useState } from "react";
import jackSprite from "@/assets/sprites/jack_russell_directions.png";

// Size of a single frame in the sprite sheet (source pixels)
const FRAME_WIDTH = 64;
const FRAME_HEIGHT = 64;

// Row index per facing direction (0-based)
const SPRITE_MAP = {
  left: 0,   // row 0
  right: 1,  // row 1
  down: 2,   // row 2
  up: 3,     // row 3
};

export default function DogSprite({
  direction = "down",
  speed = 300,
  scale = 1,
  className = "",
  "aria-label": ariaLabel = "Dog sprite",
}) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    // Clamp speed so we don't accidentally fry the CPU
    const interval = Math.max(80, Number(speed) || 300);

    const id = setInterval(() => {
      setFrame((prev) => (prev === 0 ? 1 : 0));
    }, interval);

    return () => clearInterval(id);
  }, [speed]);

  const row = SPRITE_MAP[direction] ?? SPRITE_MAP.down;
  const col = frame;

  const offsetX = -col * FRAME_WIDTH;
  const offsetY = -row * FRAME_HEIGHT;

  const width = FRAME_WIDTH * scale;
  const height = FRAME_HEIGHT * scale;

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={["sprite-dog", "bg-no-repeat", className].filter(Boolean).join(" ")}
      style={{
        backgroundImage: `url(${jackSprite})`,
        backgroundPosition: `${offsetX}px ${offsetY}px`,
        width,
        height,
        // Make it chunky pixel art instead of blurry scaling
        imageRendering: "pixelated",
      }}
    />
  );
}
