import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 128;
const TOTAL_FRAMES = 4;
const SCALE = 1; // You can adjust to 2 or 4 for pixel zoom effect

const DogSprite = () => {
  const { isWalking, isRunning, isBarking, isPooping } = useSelector((state) => state.dog);
  const [frameIndex, setFrameIndex] = useState(0);

  const getAnimationRow = () => {
    if (isPooping) return 3;      // Row 4
    if (isBarking) return 2;      // Row 3
    if (isWalking || isRunning) return 1; // Row 2
    return 0;                     // Row 1 (idle)
  };

  // Advance frame on interval
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % TOTAL_FRAMES);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const row = getAnimationRow();
  const offsetX = frameIndex * FRAME_WIDTH;
  const offsetY = row * FRAME_HEIGHT;

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 overflow-hidden pointer-events-none z-20"
      style={{
        width: FRAME_WIDTH * SCALE,
        height: FRAME_HEIGHT * SCALE,
      }}
    >
      <img
        src="/sprites/jack_russell_sprite.png"
        alt="Dog Sprite"
        style={{
          imageRendering: 'pixelated',
          width: FRAME_WIDTH * TOTAL_FRAMES,
          height: FRAME_HEIGHT * 4,
          transform: `translate(-${offsetX}px, -${offsetY}px)`,
          position: 'relative',
        }}
      />
    </div>
  );
};

export default DogSprite;