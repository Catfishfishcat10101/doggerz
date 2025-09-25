// src/components/UI/DogSprite.jsx
import React, { memo, useMemo } from "react";
import useSpriteAnimator from "@/hooks/useSpriteAnimator";
import "./DogSprite.css";
import spritePng from "@/assets/sprites/jack_russell_directions.png";

// Rows in your sheet: frames laid out horizontally, directions vertically.
const DIR_ROW = { down: 0, left: 1, right: 2, up: 3 };

/**
 * DogSprite
 * - Uses useSpriteAnimator v2 API (getStyle)
 * - Integer scaling to keep pixels crisp (prefer scale over arbitrary size)
 * - Optional mirroring: if your sheet doesn't have 'right', you can mirror 'left'
 */
function DogSprite({
  direction = "down",          // "down" | "left" | "right" | "up"
  walking = false,             // anim on/off
  frameWidth = 64,             // single tile width (px)
  frameHeight = 64,            // single tile height (px)
  frames = 4,                  // frames per row
  fps = 8,                     // animation speed
  idle = 0,                    // idle frame index when paused
  scale = 1,                   // integer scale multiplier (1, 2, 3…)
  size,                        // optional absolute size; if given, scale is derived
  mirrorRight = false,         // if true and direction === 'right', mirror 'left' row
  shadow = true,               // soft drop shadow under sprite
  className = "",
  style: styleProp = {},
  "aria-label": ariaLabel,
}) {
  // Derive integer scale from size if provided
  const _scale = useMemo(() => {
    if (!size) return Math.max(1, Math.round(scale || 1));
    return Math.max(1, Math.round(Number(size) / frameWidth));
  }, [size, scale, frameWidth]);

  const basePx = frameWidth * _scale;
  const dirRowRaw = DIR_ROW[direction] ?? 0;
  const useMirror = mirrorRight && direction === "right";
  const dirRow = useMirror ? DIR_ROW.left : dirRowRaw;

  const anim = useSpriteAnimator({
    isPlaying: walking,
    frameCount: frames,
    frameRate: fps,
    idleFrame: idle,
    initialRow: dirRow,
    pauseWhenHidden: true,
    respectReducedMotion: true,
    loop: true,
  });

  // Update row when direction changes
  React.useEffect(() => { anim.setRow(dirRow); }, [dirRow]); // eslint-disable-line react-hooks/exhaustive-deps

  // Inline style: base sprite + animator-provided backgroundPosition
  const style = useMemo(() => {
    const s = {
      width: `${basePx}px`,
      height: `${basePx}px`,
      backgroundImage: `url(${spritePng})`,
      backgroundRepeat: "no-repeat",
      imageRendering: "pixelated",
      transform: useMirror ? "scaleX(-1)" : "none",
      ...anim.getStyle({ frameWidth, frameHeight, row: dirRow }),
      ...styleProp,
    };
    // anim.getStyle sets width/height to frameWidth/Height; we overwrite to scaled size.
    s.width = `${basePx}px`;
    s.height = `${basePx}px`;
    return s;
  }, [anim, frameWidth, frameHeight, dirRow, basePx, useMirror, styleProp]);

  const label =
    ariaLabel ?? `dog ${direction} frame ${anim.frame}${walking ? " (walking)" : " (idle)"}`;

  return (
    <div
      className={[
        "dog-sprite",
        shadow && "dog-sprite--shadow",
        className,
      ].filter(Boolean).join(" ")}
      style={style}
      role="img"
      aria-label={label}
    />
  );
}

export default memo(DogSprite);
