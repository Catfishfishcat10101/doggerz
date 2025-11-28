import * as React from "react";
import { useEffect, useRef, useState } from "react";

/**
 * JackRussellPuppySprite
 * Props:
 *  - src: string | import (required)
 *  - columns: number (required)
 *  - rows: number (required)
 *  - frameWidth?: number
 *  - frameHeight?: number
 *  - scale?: number (default 1)
 *  - fps?: number (default 8)
 *  - animate?: boolean (default true)
 *  - loop?: boolean (default true)
 *  - className?: string
 *  - style?: object
 */
export default function JackRussellPuppySprite({
  src,
  columns = 1,
  rows = 1,
  frameWidth,
  frameHeight,
  scale = 1,
  fps = 8,
  animate = true,
  loop = true,
  className,
  style,
  alt = "dog sprite",
}) {
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);
  const currentFrameRef = useRef(0);

  const [loaded, setLoaded] = useState(false);
  const [frameSize, setFrameSize] = useState({ w: frameWidth || 0, h: frameHeight || 0 });
  const totalFrames = columns * rows;

  // Resolve src (support ESM import objects)
  const resolvedSrc = typeof src === "string" ? src : src?.default || src?.src || "";

  // Load image and infer frame size if needed
  useEffect(() => {
    if (!resolvedSrc) return;
    const img = new Image();
    imgRef.current = img;
    let canceled = false;

    img.onload = () => {
      if (canceled) return;
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      const inferredW = frameWidth || Math.floor(naturalW / Math.max(1, columns));
      const inferredH = frameHeight || Math.floor(naturalH / Math.max(1, rows));
      setFrameSize({ w: inferredW, h: inferredH });
      setLoaded(true);
    };
    img.onerror = (e) => {
      console.error("Sprite image failed to load", e);
      setLoaded(false);
    };

    img.src = resolvedSrc;
    return () => {
      canceled = true;
      img.onload = null;
      img.onerror = null;
      imgRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedSrc, columns, rows, frameWidth, frameHeight]);

  // Draw function
  const drawFrame = (frameIndex) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img || !loaded) return;

    const dpr = window.devicePixelRatio || 1;
    const fw = frameSize.w;
    const fh = frameSize.h;
    if (!fw || !fh) return;

    const displayW = Math.round(fw * scale);
    const displayH = Math.round(fh * scale);

    // Set canvas size for high DPI
    canvas.width = Math.max(1, displayW * dpr);
    canvas.height = Math.max(1, displayH * dpr);
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // scale for dpr
    ctx.clearRect(0, 0, displayW, displayH);

    const col = frameIndex % columns;
    const row = Math.floor(frameIndex / columns);
    const sx = col * fw;
    const sy = row * fh;

    try {
      ctx.drawImage(img, sx, sy, fw, fh, 0, 0, displayW, displayH);
    } catch (err) {
      // drawImage can throw if dimensions are wrong; fail silently but log
      console.error("Error drawing sprite frame:", err);
    }
  };

  // Animation loop
  useEffect(() => {
    if (!loaded || !animate || totalFrames <= 1 || fps <= 0) {
      // draw single frame once
      currentFrameRef.current = 0;
      drawFrame(0);
      return;
    }

    let running = true;
    const frameDuration = 1000 / fps;
    lastTimeRef.current = performance.now();

    const step = (now) => {
      if (!running) return;
      const elapsed = now - lastTimeRef.current;
      if (elapsed >= frameDuration) {
        lastTimeRef.current = now - (elapsed % frameDuration);
        currentFrameRef.current = currentFrameRef.current + 1;
        if (currentFrameRef.current >= totalFrames) {
          if (loop) currentFrameRef.current = 0;
          else {
            currentFrameRef.current = totalFrames - 1;
            running = false;
          }
        }
        drawFrame(currentFrameRef.current);
      }
      rafRef.current = requestAnimationFrame(step);
    };

    // initial draw then start RAF
    drawFrame(currentFrameRef.current);
    rafRef.current = requestAnimationFrame(step);

    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, animate, fps, loop, totalFrames, frameSize.w, frameSize.h, scale]);

  // Redraw when frameSize or loaded changes (ensures correct sizing)
  useEffect(() => {
    if (!loaded) return;
    drawFrame(currentFrameRef.current || 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, frameSize.w, frameSize.h, scale]);

  return (
    <div
      className={className}
      style={{ display: "inline-block", lineHeight: 0, verticalAlign: "middle", ...style }}
      role="img"
      aria-label={alt}
    >
      <canvas ref={canvasRef} width={1} height={1} aria-hidden="true" />
    </div>
  );
}

