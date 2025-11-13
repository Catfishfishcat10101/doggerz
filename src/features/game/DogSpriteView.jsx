// src/features/game/DogSpriteView.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

import spriteSheet from "@/assets/sprites/jack_russell_directions.png";
import {
  SPRITE_COLS,
  SPRITE_ROWS,
  getAnimationMeta,
  nextFrame
} from "./DogAnimator.js";

export default function DogSpriteView() {
  const dog = useSelector(selectDog);

  const [frameIndex, setFrameIndex] = useState(0);
  const [idleVariant, setIdleVariant] = useState("idle");
  const [attention, setAttention] = useState(false);

  /* ---------------------------------------------------------
   * RANDOM IDLE BEHAVIOR (bark / scratch)
   * --------------------------------------------------------- */
  useEffect(() => {
    if (dog.isAsleep) return;

    const timer = setInterval(() => {
      const roll = Math.random();

      if (roll < 0.05) setIdleVariant("idle_bark");
      else if (roll < 0.10) setIdleVariant("idle_scratch");
      else setIdleVariant("idle");
    }, 3000);

    return () => clearInterval(timer);
  }, [dog.isAsleep]);

  /* ---------------------------------------------------------
   * ATTENTION TRIGGER
   * dog.lastAction fires → perk animation
   * --------------------------------------------------------- */
  useEffect(() => {
    if (dog.lastAction) {
      setAttention(true);
      const t = setTimeout(() => setAttention(false), 900);
      return () => clearTimeout(t);
    }
  }, [dog.lastAction]);

  /* ---------------------------------------------------------
   * DECIDE WHICH ANIMATION TO USE
   * --------------------------------------------------------- */
  let animation = idleVariant;

  if (attention) {
    animation = "attention";
  } else if (dog.isAsleep) {
    animation = "sleep_breath";
  }

  /* ---------------------------------------------------------
   * Get animation metadata
   * --------------------------------------------------------- */
  const { row, frame, fps } = getAnimationMeta(animation, frameIndex);

  /* ---------------------------------------------------------
   * Frame Interval Clock
   * --------------------------------------------------------- */
  useEffect(() => {
    setFrameIndex(0);
    const timer = setInterval(() => {
      setFrameIndex((i) => nextFrame(animation, i));
    }, 1000 / fps);
    return () => clearInterval(timer);
  }, [animation, fps]);

  /* ---------------------------------------------------------
   * Frame Cropping Math (128×128 frame)
   * --------------------------------------------------------- */
  const col = frame;
  const backgroundPosX = -(col * (100 / (SPRITE_COLS - 1)));
  const backgroundPosY = -(row * (100 / (SPRITE_ROWS - 1)));

  /* ---------------------------------------------------------
   * Sleep Breathing Scale
   * --------------------------------------------------------- */
  const breathingScale =
    animation === "sleep_breath"
      ? 1 + Math.sin(Date.now() / 900) * 0.05
      : 1;

  /* ---------------------------------------------------------
   * Style Object
   * --------------------------------------------------------- */
  const style = {
    width: "128px",
    height: "128px",
    backgroundImage: `url(${spriteSheet})`,
    backgroundSize: `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
    backgroundPosition: `${backgroundPosX}% ${backgroundPosY}%`,

    imageRendering: "pixelated",

    transform: `scale(${breathingScale})`,
    transition: "transform 0.2s ease-out, opacity 0.2s ease-out",

    opacity: dog.isAsleep ? 0.65 : 1,

    filter: `
      drop-shadow(0px 6px 3px rgba(0,0,0,0.5))
      brightness(${attention ? 1.4 : 1})
      contrast(1.1)
    `,
  };

  /* ---------------------------------------------------------
   * Ground Shadow
   * --------------------------------------------------------- */
  const shadowStyle = {
    position: "absolute",
    bottom: "-4px",
    left: "50%",
    width: 128 * 0.55 + "px",
    height: "12px",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.35)",
    borderRadius: "50%",
    filter: "blur(4px)",
    opacity: dog.isAsleep ? 0.4 : 0.7,
  };

  /* ---------------------------------------------------------
   * Render
   * --------------------------------------------------------- */
  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative">
        <div style={shadowStyle} />
        <div style={style} />
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">
          {attention
            ? "Hey! Listening!"
            : animation === "idle_bark"
            ? "Woof!"
            : animation === "idle_scratch"
            ? "Scratch Scratch"
            : dog.isAsleep
            ? "Sleeping…"
            : "Ready To Play"}
        </p>

        <p className="text-lg sm:text-xl font-semibold tracking-wide">
          {dog.name}
        </p>
      </div>
    </div>
  );
}
