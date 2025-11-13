// src/features/game/DogSpriteView.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

import spriteSheet from "@/assets/sprites/jack_russell_directions.png";
import { animations, nextFrameMeta } from "./DogAnimator.js";

export default function DogSpriteView() {
  const dog = useSelector(selectDog);
  const [frame, setFrame] = useState(0);

  /* ---------------------------------------------------------
   * 1. Select animation based on state
   * --------------------------------------------------------- */
  let anim = "idle";

  if (dog.isAsleep) anim = "sleep";
  else if (dog.animation) anim = dog.animation; // full control from AI engine
  else if (dog.lastAction === "play") anim = "playing";
  else if (dog.lastAction === "feed") anim = "eating";
  else if (dog.stats.energy < 20) anim = "sleep";
  else if (dog.stats.happiness < 25) anim = "sad";

  const animMeta = animations[anim] ?? animations.idle;

  /* ---------------------------------------------------------
   * 2. Animation Frame Clock
   * --------------------------------------------------------- */
  useEffect(() => {
    setFrame(0); // reset frame when animation changes
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % animMeta.frames);
    }, 1000 / animMeta.fps);
    return () => clearInterval(timer);
  }, [anim]);

  /* ---------------------------------------------------------
   * 3. Background coordinates for sprite sheet
   * --------------------------------------------------------- */
  const frameX = animMeta.frameWidth * frame;
  const frameY = animMeta.frameHeight * animMeta.row;

  const style = {
    width: animMeta.frameWidth + "px",
    height: animMeta.frameHeight + "px",
    backgroundImage: `url(${spriteSheet})`,
    backgroundPosition: `-${frameX}px -${frameY}px`,
    backgroundSize: `${animMeta.sheetWidth}px ${animMeta.sheetHeight}px`,

    imageRendering: "pixelated",
    transition: "transform 0.15s ease-out, opacity 0.2s ease-out",

    /* Dynamic behavior effects */
    transform:
      anim.startsWith("walk")
        ? "translateX(2px) scale(1)" // tiny walk “bob”
        : dog.isAsleep
        ? "scale(0.94)"
        : "scale(1)",

    opacity: dog.isAsleep ? 0.65 : 1,
    filter: `
      drop-shadow(0px 6px 3px rgba(0,0,0,0.5))
      brightness(${anim === "attention" ? 1.4 : 1})
      contrast(1.1)
    `,
  };

  /* ---------------------------------------------------------
   * 4. Ground shadow (dynamic)
   * --------------------------------------------------------- */
  const shadow = (
    <div
      className="absolute"
      style={{
        bottom: "-4px",
        left: "50%",
        width: animMeta.frameWidth * 0.55 + "px",
        height: "12px",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.35)",
        borderRadius: "50%",
        filter: "blur(4px)",
        opacity: dog.isAsleep ? 0.4 : 0.7,
      }}
    />
  );

  return (
    <div className="relative flex flex-col items-center gap-3">

      <div className="relative">
        {shadow}
        <div style={style} />
      </div>

      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">
          {anim === "attention"
            ? "Needs Your Attention!"
            : anim === "idle_bark"
            ? "Woof!"
            : anim === "idle_scratch"
            ? "Scratch Scratch..."
            : dog.isAsleep
            ? "Power Nap Mode"
            : dog.lastAction === "play"
            ? "Having Fun!"
            : dog.lastAction === "feed"
            ? "Nom Nom!"
            : "Ready To Play"}
        </p>

        <p className="text-lg sm:text-xl font-semibold tracking-wide">
          {dog.name ?? "Pup"}
        </p>
      </div>
    </div>
  );
}