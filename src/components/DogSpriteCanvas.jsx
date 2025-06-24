import React, { useRef, useEffect } from 'react';

// Default sprite sheet paths
const DEFAULT_SPRITES = {
  idle: "/sprites/idle.png",
  walk: "/sprites/walk.png",
  bark: "/sprites/bark.png",
};

// Frame counts for each animation type
const FRAME_COUNTS = {
  idle: 4,
  walk: 6,
  bark: 2,
};

/**
 * @param {{
 *  action: "idle" | "walk" | "bark",
 *  sprites?: Record<string, string>,
 *  frameCounts?: Record<string, number>,
 *  fps?: number,
 *  scale?: number,
 *  width?: number,
 *  height?: number
 * }}
 */
export default function DogSpriteCanvas({
  action = 'idle',
  sprites = DEFAULT_SPRITES,
  frameCounts = FRAME_COUNTS,
  fps = 8,
  scale = 1,
  width = 150,
  height = 150,
}) {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);
  const lastTimeRef = useRef(0);
  const imgRef = useRef(null);

  // Load sprite when action changes
  useEffect(() => {
    const img = new Image();
    img.src = sprites[action];
    img.onload = () => {
      imgRef.current = img;
    };
  }, [action, sprites]);

  // Draw frame loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const interval = 1000 / fps;
    let animationId;

    const draw = (now) => {
      animationId = requestAnimationFrame(draw);

      if (!lastTimeRef.current) {
        lastTimeRef.current = now;
        return;
      }

      const delta = now - lastTimeRef.current;
      if (delta < interval) return;

      lastTimeRef.current = now - (delta % interval);
      const img = imgRef.current;

      if (!img || !img.complete) return;

      const totalFrames = frameCounts[action] || 1;
      const frameW = img.naturalWidth / totalFrames;
      const frameH = img.naturalHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(
        img,
        frameRef.current * frameW,
        0,
        frameW,
        frameH,
        0,
        0,
        frameW * scale,
        frameH * scale
      );

      frameRef.current = (frameRef.current + 1) % totalFrames;
    };

    animationId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationId);
  }, [action, frameCounts, fps, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="block mx-auto"
    />
  );
}