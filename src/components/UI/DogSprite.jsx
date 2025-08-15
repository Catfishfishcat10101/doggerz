// src/components/UI/DogSprite.jsx
import React from "react";
import { useSelector } from "react-redux";
import dogSprite from "../../assets/sprites/jack_russell_directions.png"; // Or your sprite path

const SPRITE_SIZE = 64; // px
const SPRITE_DIRECTIONS = {
  down: 0,
  left: 1,
  right: 2,
  up: 3,
};

export default function DogSprite({ x = 96, y = 96, direction = "down", isWalking = false, isDirty = false }) {
  // Optionally use Redux for more dynamic props (energy, status, etc.)
  // const dog = useSelector((state) => state.dog);

  // Pick correct row from sprite based on facing direction
  const spriteRow = SPRITE_DIRECTIONS[direction] || 0;

  return (
    <div
      className={`dog-sprite absolute`}
      style={{
        left: x,
        top: y,
        width: SPRITE_SIZE,
        height: SPRITE_SIZE,
        backgroundImage: `url(${dogSprite})`,
        backgroundPosition: `0px -${spriteRow * SPRITE_SIZE}px`,
        filter: isDirty ? "grayscale(100%) brightness(80%)" : "none",
        transition: "left 0.3s, top 0.3s, filter 0.4s",
        zIndex: 10,
        imageRendering: "pixelated",
      }}
      aria-label="Dog"
    />
  );
}
