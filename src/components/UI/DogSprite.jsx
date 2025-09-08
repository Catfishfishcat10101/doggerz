// src/components/UI/DogSprite.jsx
import React from "react";
import "./DogSprite.css"; // <- your CSS is here
import useSpriteAnimator from "../../hooks/useSpriteAnimator";
import spriteSheet from "../../assets/sprites/jack_russell_sheet.png"; // make sure this filename matches exactly

// sheet rows (top->bottom)
const ROW = { down: 0, left: 1, right: 2, up: 3 };

export default function DogSprite({
  x = 96,
  y = 96,
  direction = "down",
  walking = false,
  cols = 4,          // frames per row
  rows = 4,          // total rows
  frameWidth = 256,  // source cell width in px
  frameHeight = 256, // source cell height in px
  scale = 0.75,      // visual size multiplier
  fps = 8,
  sheet = spriteSheet,
  showShadow = true,
}) {
  const frame = useSpriteAnimator({ fps, frames: cols, playing: walking });
  const row = ROW[direction] ?? 0;

  const style = {
    position: "absolute",
    transform: `translate(${x}px, ${y}px)`,
    width: `${frameWidth * scale}px`,
    height: `${frameHeight * scale}px`,
    backgroundImage: `url(${sheet})`,
    backgroundRepeat: "no-repeat",
    // pick the current cell in the sheet
    backgroundPosition: `-${frame * frameWidth}px -${row * frameHeight}px`,
    backgroundSize: `${cols * frameWidth}px ${rows * frameHeight}px`,
    imageRendering: "pixelated",
    pointerEvents: "none",
  };

  return (
    <div className="dog-sprite" aria-label="dog" style={style}>
      {showShadow && <div className="dog-shadow" />}
    </div>
  );
}
