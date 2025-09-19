// src/components/UI/DogSprite.jsx
import React, { useMemo } from "react";
import "./DogSprite.css";

/**
 * DogSprite
 * Sprite-sheet renderer with stateful animations and direction rows.
 *
 * Props:
 * - sheet (string, required): URL/import of the base sprite sheet.
 * - frameWidth (number)  : width of one frame in px (default 64)
 * - frameHeight (number) : height of one frame in px (default 64)
 * - direction (string)   : "down" | "left" | "right" | "up" (default "down")
 * - state (string)       : "idle" | "walk" | "run" | "bark" (default "idle")
 * - steps (number|null)  : override frames per cycle for current state
 * - fps (number|null)    : override fps for current state
 * - speed (number)       : 0..1 scalar; modulates walk/run fps (default 0)
 * - scale (number)       : visual scale multiplier (default 1)
 * - startColPx (number)  : starting X offset in px (default 0)
 * - accessories (array)  : [{ sheet, z, offsetX, offsetY }] layered & synced
 * - title (string)       : accessible label/title (default "Dog")
 * - className (string)   : extra classes appended to "dog-sprite"
 *
 * Notes:
 * - Your CSS should define .dog-sprite animation keyframes (see below).
 * - This component drives everything via CSS variables so accessories stay in sync.
 */

const DIR_TO_ROW = { down: 0, left: 1, right: 2, up: 3 };

const DEFAULT_CONFIG = {
  idle: { steps: 1, fps: 1 },   // static (use CSS ::after breathe if you want)
  walk: { steps: 4, fps: 10 },
  run:  { steps: 6, fps: 14 },
  bark: { steps: 3, fps: 8 },
};

export default function DogSprite({
  sheet,
  frameWidth = 64,
  frameHeight = 64,
  direction = "down",
  state = "idle",
  steps = null,
  fps = null,
  speed = 0, // 0..1; influences walk/run tempo
  scale = 1,
  startColPx = 0,
  accessories = [],
  title = "Dog",
  className = "",
}) {
  if (!sheet) {
    // Fail-safe: render a placeholder box if the sprite sheet is missing.
    return (
      <div
        className={`dog-sprite ${className}`}
        style={{
          width: frameWidth * scale,
          height: frameHeight * scale,
          background: "repeating-conic-gradient(#ddd 0 25%, #f7f7f7 0 50%) 0/16px 16px",
          border: "1px dashed #ccc",
        }}
        aria-label={`${title} (missing sheet)`}
        title={`${title} (missing sheet)`}
      />
    );
  }

  const rowIndex = DIR_TO_ROW[direction] ?? 0;

  // Base config for this state, then apply optional overrides
  const cfg = DEFAULT_CONFIG[state] ?? DEFAULT_CONFIG.idle;
  const stp = Number(steps ?? cfg.steps ?? 1);
  let baseFps = Number(fps ?? cfg.fps ?? 1);

  // Modulate tempo with speed for walk/run
  if (state === "walk" || state === "run") {
    // 0.75x..1.35x feels natural; tweak as desired
    baseFps = clamp(baseFps * lerp(0.75, 1.35, speed), 1, 60);
  }

  // Duration for one cycle in ms: (1000 / fps) * frames
  const durMs = Math.round((1000 / baseFps) * Math.max(1, stp));

  const style = useMemo(
    () => ({
      // Size & scale
      "--fw": `${frameWidth}px`,
      "--fh": `${frameHeight}px`,
      "--scale": String(scale),

      // Sheet source & positions
      "--sheet": `url("${sheet}")`,
      "--row": String(rowIndex),
      "--col0": `${startColPx}px`,

      // Animation params
      "--dog-steps": String(stp),
      "--dog-ms": `${durMs}ms`,
    }),
    [frameWidth, frameHeight, scale, sheet, rowIndex, startColPx, stp, durMs]
  );

  // Play only for moving-ish states; idle stays paused (can use ::after breathe)
  const playing = state !== "idle";

  return (
    <div
      className={`dog-sprite ${className}`}
      style={style}
      data-anim={state}
      data-playing={playing ? "true" : "false"}
      role="img"
      aria-label={title}
      title={title}
    >
      {/* Accessory layers: stay perfectly in sync via the same CSS vars */}
      {accessories.map((acc, i) => {
        const layerStyle = {
          backgroundImage: `url("${acc.sheet}")`,
          zIndex: acc.z ?? 10 + i,
          transform:
            acc.offsetX || acc.offsetY
              ? `translate(${acc.offsetX || 0}px, ${acc.offsetY || 0}px)`
              : undefined,
        };
        return (
          <div
            key={i}
            className="dog-sprite__layer"
            style={layerStyle}
            data-sync="true"
            data-playing={playing ? "true" : "false"}
            aria-hidden="true"
          />
        );
      })}
    </div>
  );
}

/* ----------------- utils ----------------- */
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}
function lerp(a, b, t) {
  const tt = clamp(t, 0, 1);
  return a + (b - a) * tt;
}
