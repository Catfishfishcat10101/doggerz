import React from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';

interface DogSpriteProps {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
}

const DogSprite: React.FC<DogSpriteProps> = ({ x, y, direction, isMoving }) => {
  const [frame, setFrame] = React.useState(0);

  React.useEffect(() => {
    if (!isMoving) {
      setFrame(0); // Reset to idle frame when not moving
      return;
    }

    const interval = setInterval(() => {
      setFrame(prev => (prev + 1) % 6); // Cycle through 6 frames per direction
    }, 100); // Animation speed

    return () => clearInterval(interval);
  }, [isMoving]);

  // Sprite sheet layout: 6 columns × 4 rows (24 sprites total)
  // Row 0: Down (6 frames), Row 1: Right (6 frames)
  // Row 2: Up (6 frames), Row 3: Left (6 frames)
  const directionToRow: Record<Direction, number> = {
    down: 0,
    right: 1,
    up: 2,
    left: 3,
  };

  const spriteWidth = 32;
  const spriteHeight = 32;
  const row = directionToRow[direction];
  const col = frame;

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: spriteWidth,
        height: spriteHeight,
        backgroundImage: 'url(/assets/jack_russell_spritesheet.png)',
        backgroundPosition: `-${col * spriteWidth}px -${row * spriteHeight}px`,
        imageRendering: 'pixelated',
      }}
    />
  );
};

export default DogSprite;