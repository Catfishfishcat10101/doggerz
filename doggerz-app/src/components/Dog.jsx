import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { move } from "../redux/dogSlice";

const Dog = () => {
  const canvasRef = useRef(null);
  const sprite = new Image();
  const background = new Image();

  sprite.src = "/assets/sprites/jack_russell_directions.png";
  background.src = "/assets/backgrounds/yard.png";

  const frameWidth = 64;
  const frameHeight = 64;
  const totalFrames = 4;

  const canvasWidth = 256;
  const canvasHeight = 256;

  const dispatch = useDispatch();
  const { x, y, direction } = useSelector((state) => state.dog);

  const directionMap = {
    down: 0,
    left: 1,
    right: 2,
    up: 3,
  };

  const [frame, setFrame] = useState(0);

  const getRandomDirection = () => {
    const directions = ["up", "down", "left", "right"];
    return directions[Math.floor(Math.random() * directions.length)];
  };

  const moveDog = (dir) => {
    const speed = 2;
    let newX = x;
    let newY = y;

    if (dir === "left") newX = Math.max(0, x - speed);
    if (dir === "right") newX = Math.min(canvasWidth - frameWidth, x + speed);
    if (dir === "up") newY = Math.max(0, y - speed);
    if (dir === "down") newY = Math.min(canvasHeight - frameHeight, y + speed);

    dispatch(move({ x: newX, y: newY, direction: dir }));
  };

  // Animate sprite
  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const animate = () => {
      const row = directionMap[direction];
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Draw background
      ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);

      // Draw dog sprite
      ctx.drawImage(
        sprite,
        frame * frameWidth,
        row * frameHeight,
        frameWidth,
        frameHeight,
        x,
        y,
        frameWidth,
        frameHeight
      );

      setFrame((prev) => (prev + 1) % totalFrames);
    };

    const interval = setInterval(animate, 200);
    return () => clearInterval(interval);
  }, [frame, direction, x, y]);

  // Idle walking loop
  useEffect(() => {
    let isWalking = false;
    let walkInterval;
    let pauseTimeout;

    const startIdleLoop = () => {
      const loop = () => {
        if (!isWalking) {
          const dir = getRandomDirection();
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
  }, [x, y]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="rounded border border-gray-700"
      />
    </div>
  );
};

export default Dog;
