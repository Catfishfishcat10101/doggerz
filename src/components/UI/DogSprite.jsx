// src/features/DogSprite.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";

/**
 * DogSprite – works with or without a sprite sheet.
 *
 * If you pass a `sheetSrc` and frame metadata, it will animate frames.
 * Otherwise it renders a pretty placeholder block so the game always boots.
 *
 * Props:
 *  - x, y: top-left render position (px)
 *  - size: render size (px) – the sprite scales to this square
 *  - direction: "down" | "up" | "left" | "right"
 *  - isWalking: boolean – start/stop animation
 *  - fps: frames per second for walk animation
 *  - sheetSrc: optional URL for a sprite sheet
 *  - frameWidth, frameHeight: source frame dimensions on the sheet
 *  - framesPerDirection: number of columns for a row
 *  - map: map of direction -> row index (0-based)
 */
export default function DogSprite({
  x = 0,
  y = 0,
  size = 64,
  direction = "down",
  isWalking = false,
  fps = 8,
  sheetSrc,                // e.g. import dogSheet from "@assets/sprites/dog.png"
  frameWidth = 64,
  frameHeight = 64,
  framesPerDirection = 4,
  map = { down: 0, left: 1, right: 2, up: 3 },
  className = "",
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);
  const frameRef = useRef(0);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(0);

  // start/stop frame loop
  useEffect(() => {
    if (!sheetSrc || !loaded) return;

    const animate = (t) => {
      const last = lastTimeRef.current || t;
      const dt = t - last;
      const msPerFrame = 1000 / Math.max(1, fps);

      if (isWalking && dt >= msPerFrame) {
        frameRef.current = (frameRef.current + 1) % framesPerDirection;
        lastTimeRef.current = t;
      } else if (!isWalking) {
        frameRef.current = 0;
        lastTimeRef.current = t;
      }

      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [fps, isWalking, framesPerDirection, sheetSrc, loaded]);

  // compute background-position for current frame/direction
  const bgPos = useMemo(() => {
    if (!sheetSrc) return "0px 0px";
    const col = frameRef.current;
    const row = map[direction] ?? 0;
    const xpx = -(col * frameWidth);
    const ypx = -(row * frameHeight);
    return `${xpx}px ${ypx}px`;
  }, [direction, sheetSrc, map, frameWidth, frameHeight]);

  // scaled background-size so the sheet scales neatly to `size`
  const bgSize = useMemo(() => {
    if (!sheetSrc) return "auto";
    // total sheet size in source pixels
    const totalW = framesPerDirection * frameWidth;
    const totalH = (Math.max(...Object.values(map)) + 1) * frameHeight;
    // scale factor to render a single frame as `size`
    const scale = size / frameWidth;
    return `${totalW * scale}px ${totalH * scale}px`;
  }, [sheetSrc, framesPerDirection, frameWidth, frameHeight, size, map]);

  if (!sheetSrc) {
    // Fallback placeholder (no image needed)
    return (
      <div
        aria-label="Dog sprite placeholder"
        className={className}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.35)",
          background: "linear-gradient(135deg,#fcd34d,#f59e0b)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.35)",
          outline: isWalking ? `3px solid var(--ring)` : "none",
        }}
        title={`dir:${direction} walking:${isWalking}`}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        overflow: "hidden",
      }}
    >
      {/* The image element is only used to ensure loading complete; the actual visual is via background-position on the wrapper */}
      <img
        ref={imgRef}
        src={sheetSrc}
        alt=""
        style={{ display: "none" }}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(false)}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${sheetSrc})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: bgSize,
          backgroundPosition: bgPos,
          imageRendering: "pixelated",
        }}
      />
    </div>
  );
}

DogSprite.propTypes = {
  x: PropTypes.number,
  y: PropTypes.number,
  size: PropTypes.number,
  direction: PropTypes.oneOf(["down", "up", "left", "right"]),
  isWalking: PropTypes.bool,
  fps: PropTypes.number,
  sheetSrc: PropTypes.string,
  frameWidth: PropTypes.number,
  frameHeight: PropTypes.number,
  framesPerDirection: PropTypes.number,
  map: PropTypes.object,
  className: PropTypes.string,
};