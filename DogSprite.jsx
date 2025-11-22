import { useEffect, useRef, useState } from 'react';

const SPRITESHEET_URL = "/mnt/data/d512de6a-f45c-4cf0-9aaa-da6f0a9c6587.png"; // use your local path

const SPRITE_SIZE = 128;
const SCALE = 2;
const FPS = 8;
const FRAMES_PER_ROW = 16;

const ANIMATION_ROWS = {
  idle: 0,
  walk: 1,
  sleep: 8,
};

export default function DogSprite({ animation = 'idle' }) {
  const canvasRef = useRef(null);
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % FRAMES_PER_ROW);
    }, 1000 / FPS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.src = SPRITESHEET_URL;
    img.onload = () => {
      const row = ANIMATION_ROWS[animation] || 0;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(
        img,
        frame * SPRITE_SIZE,
        row * SPRITE_SIZE,
        SPRITE_SIZE,
        SPRITE_SIZE,
        0,
        0,
        SPRITE_SIZE * SCALE,
        SPRITE_SIZE * SCALE
      );
    };
  }, [frame, animation]);

  return (
    <canvas
      ref={canvasRef}
      width={SPRITE_SIZE * SCALE}
      height={SPRITE_SIZE * SCALE}
      className="pixelated"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
