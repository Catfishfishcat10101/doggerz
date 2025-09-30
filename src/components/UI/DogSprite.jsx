import React from "react";
// keep the file in src/assets/sprites/dog_walk.png (8 cols x 1 row; 96x96 each)
import sheet from "@/assets/sprites/dog_walk.png";

export default function DogSprite({ x = 0, y = 0, frame = 0 }) {
  const W = 96, H = 96, COLS = 8;
  const bx = -((frame % COLS) * W);
  const by = -(Math.floor(frame / COLS) * H);
  return (
    <div
      className="absolute"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${W}px`,
        height: `${H}px`,
        backgroundImage: `url(${sheet})`,
        backgroundPosition: `${bx}px ${by}px`,
        backgroundRepeat: "no-repeat",
        imageRendering: "pixelated",
      }}
    />
  );
}