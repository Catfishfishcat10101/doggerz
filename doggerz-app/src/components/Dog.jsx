import React, { useRef, useEffect, useState } from "react";

const Dog = () => {
  const canvasRef = useRef(null);
  const sprite = new Image();
  sprite.src = "/assets/sprites/jack_russell_directions.png";

  const frameWidth = 64;
  const frameHeight = 64;
  const totalFrames = 4;

  const canvasWidth = 256;
  const canvasHeight = 256;

  const [frame, setFrame] = useState(0);
  const [direction, setDirection] = useState("down");
  const [x, setX] = useState(96); // center start
  const [y, setY] = useState(96);

  const directionMap = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  };

  const getRandomDirection = () => {
    const directions = ["up", "down", "left", "right"];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  const moveDog = (dir) => {
    const speed = 2;
    setDirection(dir);
    setX((prevX) => {
      if (dir === "left") return Math.max(0, prevX - speed);
      if (dir === "right") return Math.min(canvasWidth - frameWidth, prevX + speed);
      return prevX;
    });
    setY((prevY) => {
      if (dir === "up") return Math.max(0, prevY - speed);
      if (dir === "down") return Math.min(canvasHeight - frameHeight, prevY + speed);
      return prevY;
    });
  };

  // Animate sprite
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const animate = () => {
      const row = directionMap[direction];
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(
        sprite,
        frame * frameWidth, row * frameHeight,
        frameWidth, frameHeight,
        x, y,
        frameWidth, frameHeight
      );
      setFrame((prev) => (prev + 1) % totalFrames);
    };

    const interval = setInterval(animate, 200);
    return () => clearInterval(interval);
  }, [frame, direction, x, y]);

  // Idle walking AI
  useEffect(() => {
    let isWalking = false;
    let walkInterval;
    let pauseTimeout;

    const startIdleLoop = () => {
      const loop = () => {
        if (!isWalking) {
          const dir = getRandomDirection();
          setDirection(dir);
          isWalking = true;

          walkInterval = setInterval(() => moveDog(dir), 100);

          pauseTimeout = setTimeout(() => {
            clearInterval(walkInterval);
            isWalking = false;
            setTimeout(loop, Math.random() * 3000 + 1000); // pause 1–4 sec
          }, Math.random() * 1500 + 1000); // walk 1–2.5 sec
        }
      };
      loop();
    };

    startIdleLoop();

    return () => {
      clearInterval(walkInterval);
      clearTimeout(pauseTimeout);
    };
  }, []);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="rounded border border-gray-700 bg-green-100"
      />
    </div>
  );
};

export default Dog;
