import React, { useMemo } from "react";
import "./DogSprite.css";
import sprite from "@/assets/sprites/jack_russell_directions.png";

/**
 * DogSprite
 * Drives the CSS variables in DogSprite.css to render/animate a sprite sheet.
 *
 * Parent requirement: the parent "world" element should be `position: relative`
 * so the absolute-positioned container can place the sprite correctly.
 *
 * Props:
 *  - x: world X in px (centered on sprite). Default 0
 *  - worldBottomPct: bottom position as % of world height (0..100). Default 0
 *  - w/h: frame size in px (one frame on the sheet). Default 96/96
 *  - scale: integer pixel scale (1,2,3…). Default 1
 *  - frames: number of frames across the row. Default 6
 *  - speedMs: duration of one animation loop. Default 1200
 *  - playing: run vs. pause animation. Default true
 *  - faceLeft: mirror horizontally. Default false
 *  - row: sheet row index (0-based). Default 0
 *  - shadow: add elliptical shadow pseudo-element. Default true
 *  - interactive: focus ring + pointer + onClick. Default true
 *  - title: aria-label for screen readers. Default "Dog sprite"
 *  - onClick: click handler (only if interactive)
 */
export default function DogSprite({
  x = 0,
  worldBottomPct = 0,
  w = 96,
  h = 96,
  scale = 1,
  frames = 6,
  speedMs = 1200,
  playing = true,
  faceLeft = false,
  row = 0,
  shadow = true,
  interactive = true,
  title = "Dog sprite",
  onClick,
  className = "",
}) {
  // Respect reduced-motion: pause unless explicitly told otherwise
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const playState = (prefersReduced ? false : playing) ? "running" : "paused";

  // Offset to select the correct row of the sheet
  const bgPosY = useMemo(() => `-${row * h}px`, [row, h]);

  const spriteClass = [
    "dog-sprite",
    "dog-sprite--walk",
    shadow && "dog-sprite--shadow",
    interactive && "dog-sprite--interactive",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="dog-sprite-container"
      style={{
        left: `${x}px`,
        bottom: `${worldBottomPct}%`,
      }}
      aria-hidden={!interactive}
    >
      <button
        type="button"
        className={spriteClass}
        title={title}
        aria-label={title}
        onClick={interactive ? onClick : undefined}
        style={{
          backgroundImage: `url(${sprite})`,
          backgroundPositionY: bgPosY,

          // CSS variable contract (see DogSprite.css for defaults)
          ["--sprite-w"]: `${w}px`,
          ["--sprite-h"]: `${h}px`,
          ["--sprite-scale"]: String(scale),
          ["--frames"]: String(frames),
          ["--speed-ms"]: `${speedMs}ms`,
          ["--play"]: playState,
          ["--flipX"]: faceLeft ? -1 : 1,
        }}
      />
    </div>
  );
}
