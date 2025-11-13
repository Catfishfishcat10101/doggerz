// src/pages/Game.jsx
import React, { useState, useEffect, useCallback } from "react";
import DogSprite from "@/UI/DogSprite";
import yardBg from "@/assets/backgrounds/yard_day.png";

const STEP = 16; // pixels per move
const MAP_WIDTH = 1024;
const MAP_HEIGHT = 1024;

const Game = () => {
  const [position, setPosition] = useState({ x: 480, y: 480 });
  const [direction, setDirection] = useState("down");
  const [moving, setMoving] = useState(false);

  const handleKeyDown = useCallback((e) => {
    setMoving(true);
    setDirection((prev) => {
      if (e.key === "ArrowLeft") return "left";
      if (e.key === "ArrowRight") return "right";
      if (e.key === "ArrowUp") return "up";
      if (e.key === "ArrowDown") return "down";
      return prev;
    });

    setPosition((pos) => {
      let newX = pos.x;
      let newY = pos.y;

      if (e.key === "ArrowLeft") newX = Math.max(0, pos.x - STEP);
      if (e.key === "ArrowRight") newX = Math.min(MAP_WIDTH - 64, pos.x + STEP);
      if (e.key === "ArrowUp") newY = Math.max(0, pos.y - STEP);
      if (e.key === "ArrowDown") newY = Math.min(MAP_HEIGHT - 64, pos.y + STEP);

      return { x: newX, y: newY };
    });
  }, []);

  const handleKeyUp = () => setMoving(false);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown]);

  return (
    <div
      className="relative overflow-hidden"
      style={{
        width: "100vw",
        height: "100vh",
        backgroundImage: `url(${yardBg})`,
        backgroundSize: "cover",
        imageRendering: "pixelated",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: position.y,
          left: position.x,
          transition: "top 0.15s, left 0.15s",
        }}
      >
        <DogSprite direction={direction} speed={moving ? 200 : 800} scale={2} />
      </div>
    </div>
  );
};

export default Game;
