// src/components/Dog3DSprite.jsx
import React from "react";

import puppySprite from "@/assets/dog/dog-3d-puppy.png";
import adultSprite from "@/assets/dog/dog-3d-adult.png";
import seniorSprite from "@/assets/dog/dog-3d-senior.png";

const SPRITES_BY_STAGE = {
  puppy: puppySprite,
  adult: adultSprite,
  senior: seniorSprite,
};

/**
 * Dog3DSprite
 * Large hero dog sprite with a gentle idle animation.
 *
 * Props:
 *  - stage: "puppy" | "adult" | "senior"
 *  - size?: "sm" | "md" | "lg"
 */
export default function Dog3DSprite({
  stage = "puppy",
  size = "md",
  className = "",
}) {
  const src = SPRITES_BY_STAGE[stage] ?? puppySprite;

  const sizeClass =
    size === "lg"
      ? "w-[58%] max-w-xs"
      : size === "sm"
        ? "w-[40%] max-w-[160px]"
        : "w-[50%] max-w-[200px]";

  return (
    <div
      className={["pointer-events-none select-none", className]
        .filter(Boolean)
        .join(" ")}
    >
      <img
        src={src}
        alt="Your Doggerz pup"
        className={[
          sizeClass,
          "mx-auto drop-shadow-[0_18px_30px_rgba(0,0,0,0.55)]",
          "animate-doggerz-bob",
        ].join(" ")}
      />
    </div>
  );
}
