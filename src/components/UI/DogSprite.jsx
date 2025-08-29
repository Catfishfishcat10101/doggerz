// src/components/UI/DogSprite.jsx
import React from "react";
import useSpriteAnimator from "../../hooks/useSpriteAnimator";
import spriteSheet from "../../assets/sprites/jack_russell_sheet.png"; // <- your image

// Map directions to row indexes in the sheet.
// Adjust if your rows are ordered differently.
const ROW = { down: 0, left: 1, right: 2, up: 3 };

/**
 * Draws a single animated sprite from a sprite sheet laid out in a grid.
 * Assumes each row = one direction; each column = a frame.
 */
export default function DogSprite({
  x = 96,
  y = 96,
  direction = "down",
  walking = false,
  cols = 4,            // number of frames per row (columns)
  rows = 4,            // number of rows (directions)
  frameWidth = 256,    // width of a single cell in the sheet (px)
  frameHeight = 256,   // height of a single cell (px)
  scale = 0.75,        // visual scale on screen
  fps = 8,
  sheet = spriteSheet, // override if you swap art
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
    backgroundPosition: `-${frame * frameWidth}px -${row * frameHeight}px`,
    imageRendering: "pixelated", // keeps it crisp
  };

  return <div aria-label="dog" style={style} />;
}
