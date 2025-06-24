import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import spritesheet from '../assets/sprites/jack_russell_directions.png';

const FRAME_WIDTH = 128;
const FRAME_HEIGHT = 128;
const TOTAL_FRAMES = 4;
const SCALE = 1; // Use 2 or 4 if you want it pixel-scaled

const DogSprite = () => {
  const { isWalking, isRunning, isBarking, isPooping } = useSelector((state) => state.dog);
  const [frameIndex, setFrameIndex] = useState(0);

  // Choose which row of the sprite sheet to use
  const getAnimationRow = () => {
    if (isPooping) return 3;     // Row 4 = pooping
    if (isBarking) return 2;     // Row 3 = barking
    if (isWalking || isRunning) return 1; // Row 2 = walking/running
    return 0;                    // Row 1 = idle
  };

  // Frame animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % TOTAL_FRAMES);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const row = getAnimationRow();
  const offsetX = frameIndex * FRAME_WIDTH;
  const offsetY = row * FRAME_HEIGHT;

  return (
    <div
      className="w-[128px] h-[128px] overflow-hidden"
      style={{
        width: FRAME_WIDTH * SCALE,
        height: FRAME_HEIGHT * SCALE,
      }}
    >
      <img
        src={spritesheet}
        alt="Dog Sprite"
        style={{
          imageRendering: 'pixelated',
          width: FRAME_WIDTH * TOTAL_FRAMES,
          height: FRAME_HEIGHT * 4, // assuming 4 rows
          transform: `translate(-${offsetX}px, -${offsetY}px)`,
          position: 'relative',
        }}
      />
    </div>
  );
};

export default DogSprite;