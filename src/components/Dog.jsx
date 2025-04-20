import React, { useRef, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { move } from "../redux/dogSlice";
import barkSoundSrc from "../assets/audio/bark.mp3";
import poopSprite from "../assets/sprites/poop.png";
import dayBg from "../assets/backgrounds/yard_day.png";
import nightBg from "../assets/backgrounds/yard_night.png";
import dogSprite from "../assets/sprites/jack_russell_directions.png";

const Dog = ({ poops, setPoops }) => {
  const canvasRef = useRef(null);
  const frameWidth = 64;
  const frameHeight = 64;
  const canvasWidth = 256;
  const canvasHeight = 256;
  const totalFrames = 4;

  const dispatch = useDispatch();
  const { x, y, direction, pottyTrained, soundEnabled } = useSelector((state) => state.dog);
  const directionMap = { down: 0, left: 1, right: 2, up: 3 };

  const [frame, setFrame] = useState(0);
  const [spriteLoaded, setSpriteLoaded] = useState(false);
  const [bgLoaded, setBgLoaded] = useState(false);
  const [background, setBackground] = useState(new Image());
  const [sprite, setSprite] = useState(new Image());
  const barkAudio = useRef(new Audio(barkSoundSrc));

  useEffect(() => {
    const s = new Image();
    s.src = dogSprite;
    s.onload = () => {
      setSprite(s);
      setSpriteLoaded(true);
    };

    const hour = new Date().getHours();
    const bg = new Image();
    bg.src = hour >= 7 && hour <= 19 ? dayBg : nightBg;
    bg.onload = () => {
      setBackground(bg);
      setBgLoaded(true);
    };
  }, []);

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

  // Poop and bark loop
  useEffect(() => {
    const maybePoop = () => {
      if (!pottyTrained && Math.random() < 0.15) {
        setPoops((prev) => [...prev, { x, y, timestamp: Date.now() }]);
      }
    };

    const maybeBark = () => {
      if (soundEnabled && Math.random() < 0.3) {
        barkAudio.current.play();
      }
    };

    const loop = setInterval(() => {
      maybePoop();
      maybeBark();
    }, 3000);

    return () => clearInterval(loop);
  }, [x, y, pottyTrained, soundEnabled, setPoops]);

  // Clear old poops
  useEffect(() => {
    const cleanup = setInterval(() => {
      setPoops((prev) => prev.filter((p) => Date.now() - p.timestamp < 8000));
    }, 2000);
    return () => clearInterval(cleanup);
  }, [setPoops]);

  // Draw everything on canvas
  useEffect(() => {
    if (!spriteLoaded || !bgLoaded) return;
    const ctx = canvasRef.current.getContext("2d");

    const draw = () => {
      const row = directionMap[direction];
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight);
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

      // Draw poop sprites
      poops.forEach(({ x, y }) => {
        const poopImg = new Image();
        poopImg.src = poopSprite;
        ctx.drawImage(poopImg, x + 10, y + 10, 24, 24);
      });

      setFrame((prev) => (prev + 1) % totalFrames);
    };

    const interval = setInterval(draw, 200);
    return () => clearInterval(interval);
  }, [spriteLoaded, bgLoaded, frame, x, y, direction, poops]);

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
            setTimeout(loop, Math.random() * 3000 + 1000);
          }, Math.random() * 1500 + 1000);
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
