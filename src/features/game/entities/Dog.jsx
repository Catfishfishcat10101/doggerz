// src/features/game/entities/Dog.jsx
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import DogSprite from "@/components/UI/DogSprite.jsx";
import { selectDog, selectDogLevel } from "@/redux/dogSlice.js";

/**
 * Dog entity wrapper
 * - Centers the dog in the yard
 * - Picks direction + scale
 * - Respects reduced-motion
 */
export default function Dog({
  dir,          // optional override: "left" | "right" | "up" | "down"
  scale: scaleProp,
  className = "",
  onClick,
}) {
  const dog = useSelector(selectDog);
  const level = useSelector(selectDogLevel);

  // Basic growth curve: level 1–10 => scale 1.0–1.4 (cap at 1.4)
  const scale = useMemo(() => {
    if (typeof scaleProp === "number" && scaleProp > 0) return scaleProp;
    const lvl = Number(level || 1);
    return Math.min(1.0 + (lvl - 1) * 0.04, 1.4);
  }, [level, scaleProp]);

  // Future: if you store direction in state.dog.direction, use that
  const direction = dir || dog.direction || "down";

  // Respect prefers-reduced-motion by slowing animation way down
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const speed = prefersReduced ? 2000 : 300; // ms between frame flips

  return (
    <div
      className={[
        "flex items-end justify-center pointer-events-none",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Dog entity"
    >
      <div className="pointer-events-auto" onClick={onClick}>
        <DogSprite
          direction={direction}
          speed={speed}
          scale={scale}
          aria-label={dog.name || "Your dog"}
        />
      </div>
    </div>
  );
}
