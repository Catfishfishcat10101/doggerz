// src/features/game/DogSpriteView.jsx
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

import jackSheet from "@/assets/sprites/jack_russell_directions.png";
import {
  SPRITE_COLS,
  SPRITE_ROWS,
  nextFrame,
  getAnimationMeta,
} from "./DogAnimator.js";

export default function DogSpriteView() {
  const dog = useSelector(selectDog);

  const [frameIndex, setFrameIndex] = useState(0);

  /** Dynamic animation selection */
  let animation = "idle";

  if (dog.isAsleep) animation = "sleep";
  else if (dog.lastAction === "play") animation = "playing";
  else if (dog.lastAction === "feed") animation = "eating";
  else if (dog.stats.happiness < 25) animation = "sad";
  else if (dog.stats.energy < 20) animation = "sleep";
  else animation = "idle";

  /** Get frame metadata */
  const { frame, row, fps } = getAnimationMeta(animation, frameIndex);

  /** Animation clock */
  useEffect(() => {
    const interval = setInterval(() => {
      setFrameIndex((i) => nextFrame(animation, i));
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [animation, fps]);

  /** CSS background-position math */
  const backgroundPosX = -(frame * (100 / (SPRITE_COLS - 1)));
  const backgroundPosY = -(row * (100 / (SPRITE_ROWS - 1)));

  const style = {
    width: "128px",
    height: "128px",
    backgroundImage: `url(${jackSheet})`,
    backgroundSize: `${SPRITE_COLS * 100}% ${SPRITE_ROWS * 100}%`,
    backgroundPosition: `${backgroundPosX}% ${backgroundPosY}%`,
    imageRendering: "pixelated",
    transition: "transform 200ms, opacity 200ms",
    transform: dog.isAsleep ? "scale(0.94)" : "scale(1)",
    opacity: dog.isAsleep ? 0.65 : 1,
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div style={style} />

      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">
          {dog.isAsleep
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
