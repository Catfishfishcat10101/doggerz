// src/components/game/Dog.jsx
import React, { useMemo } from "react";
import DogSprite from "@/components/UI/DogSprite.jsx";

/**
 * Dog (game entity)
 * Thin wrapper that maps game state → sprite props.
 *
 * Props:
 *  - x, y: world coordinates in px (y is from bottom; see container)
 *  - dir:  "left" | "right"
 *  - state: "walk" | "idle" | "run" | "sit" (extend as you add rows)
 *  - speedMs: duration for a full cycle (lower = faster)
 *  - scale: pixel scale factor (1,2,3…)
 *  - reduced: boolean (override prefers-reduced-motion if you want)
 */
export default function Dog({
  x = 0,
  y = 0,
  dir = "right",
  state = "walk",
  speedMs,
  scale = 1,
  reduced,
  className = "",
  onClick,
}) {
  // Honor prefers-reduced-motion unless caller forces reduced explicitly
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const playing = useMemo(() => {
    if (reduced === true) return false;
    if (reduced === false) return true;
    return !prefersReduced;
  }, [reduced, prefersReduced]);

  // Map logical states to sheet rows / frames / default speed
  // Adjust to your sheet layout (row indexes and frames per row).
  const spritePlan = useMemo(() => {
    switch (state) {
      case "run":
        return { row: 1, frames: 6, defaultMs: 700 };
      case "idle":
        return { row: 2, frames: 4, defaultMs: 1600 };
      case "sit":
        return { row: 3, frames: 2, defaultMs: 1400 };
      case "walk":
      default:
        return { row: 0, frames: 6, defaultMs: 1200 };
    }
  }, [state]);

  const ms = speedMs ?? spritePlan.defaultMs;
  const faceLeft = dir === "left";

  return (
    <div
      className={`absolute ${className}`}
      style={{
        left: 0,
        right: 0,
        bottom: 0,
        // This inner wrapper creates a “world” relative anchor so we can position by x/y.
        // It spans the full stage; we position the sprite’s container using its API.
      }}
      aria-label="Dog entity"
    >
      {/* The DogSprite uses absolute positioning via its own container.
          worldBottomPct expects % of parent height; we convert y px -> % using CSS var if you have one,
          but the simplest path: give worldBottomPct as 0 and pass y as part of the container offset. */}
      <div className="relative" style={{ height: 0 }}>
        <DogSprite
          // placement
          x={x}
          worldBottomPct={0} // keep 0; we apply y in transform so pixels stay exact
          // sprite sheet controls
          w={96}
          h={96}
          scale={scale}
          frames={spritePlan.frames}
          row={spritePlan.row}
          speedMs={ms}
          playing={playing}
          faceLeft={faceLeft}
          // UX
          shadow
          interactive
          title="Your dog"
          onClick={onClick}
          // push vertical offset via a class hook
          className="dog-offset"
        />
      </div>

      {/* Inline style to push the sprite up by y px without fighting the component’s own transforms */}
      <style>{`.dog-offset { transform: translateY(-${y}px); }`}</style>
    </div>
  );
}
