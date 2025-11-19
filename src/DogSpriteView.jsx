// src/DogSpriteView.jsx
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

import spriteSheet from "@/assets/sprites/jack_russell_directions.png";
import { getAnimationMeta, nextFrame } from "@/DogAnimator.jsx";

export default function DogSpriteView() {
  const dog = useSelector(selectDog);

  if (!dog) return null;

  const [frameIndex, setFrameIndex] = useState(0);
  const [idleVariant, setIdleVariant] = useState("idle");
  const [attention, setAttention] = useState(false);

  // RANDOM IDLE VARIANTS
  useEffect(() => {
    if (!dog || dog.isAsleep) return;

    const timer = setInterval(() => {
      const roll = Math.random();

      if (roll < 0.05) setIdleVariant("idle_bark");
      else if (roll < 0.1) setIdleVariant("idle_scratch");
      else setIdleVariant("idle");
    }, 3000);

    return () => clearInterval(timer);
  }, [dog]);

  // ATTENTION TRIGGER
  useEffect(() => {
    if (!dog) return;
    // NOTE: right now dog.lastAction is never set in state,
    // so this will never fire until we wire that up in the UI/slice.
    if (dog.lastAction) {
      setAttention(true);
      const t = setTimeout(() => setAttention(false), 900);
      return () => clearTimeout(t);
    }
  }, [dog]);

  // PICK ANIMATION
  let animation = idleVariant;
  if (attention) animation = "attention";
  else if (dog.isAsleep) animation = "sleep";

  // METADATA FROM ANIMATOR
  const meta = getAnimationMeta(animation);
  const { row, frameWidth, frameHeight, sheetWidth, sheetHeight, fps } = meta;

  // FRAME CLOCK
  useEffect(() => {
    setFrameIndex(0);
    const timer = setInterval(
      () => setFrameIndex((i) => nextFrame(animation, i)),
      1000 / fps
    );
    return () => clearInterval(timer);
  }, [animation, fps]);

  // CROP POSITION
  const frameX = -(frameIndex * frameWidth);
  const frameY = -(row * frameHeight);

  // SLEEP BREATHING
  const breathingScale =
    animation === "sleep" ? 1 + Math.sin(Date.now() / 900) * 0.05 : 1;

  const style = {
    width: `${frameWidth}px`,
    height: `${frameHeight}px`,
    backgroundImage: `url(${spriteSheet})`,
    backgroundSize: `${sheetWidth}px ${sheetHeight}px`,
    backgroundPosition: `${frameX}px ${frameY}px`,
    imageRendering: "pixelated",
    transform: `scale(${breathingScale})`,
    transition: "transform 0.2s ease-out, opacity 0.2s ease-out",
    opacity: dog.isAsleep ? 0.65 : 1,
    filter: `
      drop-shadow(0px 6px 3px rgba(0,0,0,0.5))
      brightness(${attention ? 1.35 : 1})
      contrast(1.1)
    `,
  };

  const shadowStyle = {
    position: "absolute",
    bottom: "-4px",
    left: "50%",
    width: frameWidth * 0.55 + "px",
    height: "12px",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,0.35)",
    borderRadius: "50%",
    filter: "blur(4px)",
    opacity: dog.isAsleep ? 0.4 : 0.7,
  };

  return (
    <div className="relative flex flex-col items-center gap-3">
      <div className="relative">
        <div style={shadowStyle} />
        <div style={style} />
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">
          {attention
            ? "Listening!"
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
