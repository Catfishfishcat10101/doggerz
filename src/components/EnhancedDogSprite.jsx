// src/components/EnhancedDogSprite.jsx
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import {
  calculateDogAge,
  getSpriteForLifeStage,
} from "@/utils/lifecycle.js";

const FRAME_SIZE = 96;
const FRAME_COUNT = 8;
const FRAME_DURATION_MS = 140;

export default function EnhancedDogSprite() {
  const dog = useSelector(selectDog);

  const [frameIndex, setFrameIndex] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  if (!dog) {
    return (
      <p className="text-xs text-zinc-400">
        No pup yet. Adopt one to bring this area to life.
      </p>
    );
  }

  const adoptedAt = dog.adoptedAt ?? dog.createdAt ?? null;
  const ageInfo = adoptedAt ? calculateDogAge(adoptedAt) : null;
  const stageId = ageInfo?.stageId ?? "PUPPY";

  const spriteSrc = getSpriteForLifeStage(stageId);

  useEffect(() => {
    const id = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % FRAME_COUNT);
    }, FRAME_DURATION_MS);

    return () => clearInterval(id);
  }, []);

  if (!spriteSrc) {
    return (
      <p className="text-xs text-zinc-400">
        Sprite not configured for stage {stageId}. Check getSpriteForLifeStage().
      </p>
    );
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-zinc-500">
          Loading sprite…
        </div>
      )}

      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center text-xs text-red-400">
          Couldn&apos;t load sprite. Check image path in lifecycle.js.
        </div>
      )}

      <div className="relative w-24 h-24 overflow-hidden rounded-xl bg-zinc-900/80 shadow-lg">
        <img
          src={spriteSrc}
          alt={dog.name || "Your pup"}
          className="absolute top-0 left-0"
          style={{
            height: FRAME_SIZE,
            width: "auto",
            transform: `translateX(${-frameIndex * FRAME_SIZE}px)`,
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true);
            setIsLoaded(true);
          }}
        />
      </div>
    </div>
  );
}
