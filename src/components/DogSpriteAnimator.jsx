// src/components/DogSpriteAnimator.jsx
// @ts-nocheck
import { useEffect, useMemo, useRef, useState } from "react";

function clampInt(n, min, max) {
  const x = Number.isFinite(Number(n)) ? Number(n) : min;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

/**
 * Renders a cropped, animated frame from a sprite sheet (grid).
 * - Uses a DIV with background-image to show ONLY one frame at a time.
 * - This prevents the "entire sheet" rendering problem.
 */
export default function DogSpriteAnimator({
  src,
  cols = 8,
  rows = 8,
  fps = 8,
  sequence = [0, 1, 2, 3, 4, 5, 6, 7],
  frameWidth = 128,
  frameHeight = 128,
  scale = 2.4,
  pixelated = false,
  className = "",
  style = {},
  paused = false,
}) {
  const [frameIdx, setFrameIdx] = useState(0);
  const rafRef = useRef(0);
  const lastRef = useRef(0);

  const safeCols = clampInt(cols, 1, 256);
  const safeRows = clampInt(rows, 1, 256);
  const safeFps = Math.max(1, Math.min(60, Number(fps) || 8));
  const safeSeq = Array.isArray(sequence) && sequence.length ? sequence : [0];

  useEffect(() => {
    if (paused) return;

    const stepMs = 1000 / safeFps;

    const loop = (t) => {
      if (!lastRef.current) lastRef.current = t;
      const delta = t - lastRef.current;

      if (delta >= stepMs) {
        lastRef.current = t;
        setFrameIdx((i) => (i + 1) % safeSeq.length);
      }
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [paused, safeFps, safeSeq.length]);

  // Current frame number within the sheet
  const frameNumber = safeSeq[frameIdx] ?? 0;

  const x = frameNumber % safeCols;
  const y = Math.floor(frameNumber / safeCols) % safeRows;

  const width = frameWidth * scale;
  const height = frameHeight * scale;

  const bgSizeX = safeCols * frameWidth * scale;
  const bgSizeY = safeRows * frameHeight * scale;

  const bgPosX = -(x * frameWidth * scale);
  const bgPosY = -(y * frameHeight * scale);

  const computedStyle = useMemo(
    () => ({
      width,
      height,
      backgroundImage: `url(${src})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: `${bgSizeX}px ${bgSizeY}px`,
      backgroundPosition: `${bgPosX}px ${bgPosY}px`,
      imageRendering: pixelated ? "pixelated" : "auto",
      ...style,
    }),
    [width, height, src, bgSizeX, bgSizeY, bgPosX, bgPosY, pixelated, style],
  );

  return (
    <div
      className={className}
      style={computedStyle}
      aria-label="Dog sprite animation"
      role="img"
    />
  );
}
