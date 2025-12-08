// @ts-nocheck
// src/components/JackRussellPuppySprite.jsx
//
// Generic sprite-strip renderer for the Jack Russell puppy.
// Works with multi-row, multi-column sprite sheets.
// Controlled by props: columns, rows, fps, scale, animate, loop.

import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

export default function JackRussellPuppySprite({
  src,
  columns,
  rows,
  fps = 8,
  scale = 1,
  animate = true,
  loop = true,
  className = "",
  style = {},
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(new Image());
  const frameRef = useRef(0);
  const rafRef = useRef(null);

  const [loaded, setLoaded] = useState(false);

  // Load sprite sheet
  useEffect(() => {
    imgRef.current.src = src;
    imgRef.current.onload = () => setLoaded(true);
  }, [src]);

  useEffect(() => {
    if (!loaded) return;

    const ctx = canvasRef.current.getContext("2d");
    const img = imgRef.current;

    const frameWidth = img.width / columns;
    const frameHeight = img.height / rows;

    let lastFrameTime = performance.now();
    const frameDuration = 1000 / fps;

    function drawFrame() {
      const now = performance.now();
      const elapsed = now - lastFrameTime;

      if (animate && elapsed >= frameDuration) {
        frameRef.current++;
        lastFrameTime = now;

        if (frameRef.current >= columns * rows) {
          frameRef.current = loop ? 0 : columns * rows - 1;
        }
      }

      const frameIndex = frameRef.current;
      const col = frameIndex % columns;
      const row = Math.floor(frameIndex / columns);

      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(
        img,
        col * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        0,
        0,
        frameWidth * scale,
        frameHeight * scale
      );

      rafRef.current = requestAnimationFrame(drawFrame);
    }

    drawFrame();
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate, loaded, fps, columns, rows, scale, loop]);

  if (!loaded) {
    return <div className="text-xs text-slate-400">Loading puppy…</div>;
  }

  return (
    <canvas
      ref={canvasRef}
      width={(imgRef.current.width / columns) * scale}
      height={(imgRef.current.height / rows) * scale}
      className={className}
      style={style}
    />
  );
}

JackRussellPuppySprite.propTypes = {
  src: PropTypes.string.isRequired,
  columns: PropTypes.number.isRequired,
  rows: PropTypes.number.isRequired,
  fps: PropTypes.number,
  scale: PropTypes.number,
  animate: PropTypes.bool,
  loop: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
};
