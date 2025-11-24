// src/components/EnhancedDogSprite.jsx
// @ts-nocheck

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import { selectWeatherCondition } from "@/redux/weatherSlice.js";

import { calculateDogAge, getSpriteForLifeStage } from "@/utils/lifecycle.js";

const FRAME_SIZE = 96; // legacy horizontal strip width per frame
const FRAME_COUNT = 8; // legacy frames per animation
const BASE_FRAME_DURATION_MS = 140; // ~7 FPS

export default function EnhancedDogSprite() {
  const dog = useSelector(selectDog);
  const weather = useSelector(selectWeatherCondition);

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

  // Senior slowdown 0.8x speed => longer frame duration
  const frameDuration = (() => {
    if (!dog) return BASE_FRAME_DURATION_MS;
    const adoptedAt = dog.adoptedAt ?? dog.createdAt ?? Date.now();
    const ageInfo = calculateDogAge(adoptedAt);
    const stageId = ageInfo?.stageId ?? "PUPPY";
    if (stageId === "SENIOR") return Math.round(BASE_FRAME_DURATION_MS * 1.25); // slower
    return BASE_FRAME_DURATION_MS;
  })();

  useEffect(() => {
    const id = setInterval(
      () => setFrameIndex((prev) => (prev + 1) % FRAME_COUNT),
      frameDuration,
    );
    return () => clearInterval(id);
  }, [frameDuration]);

  if (!spriteSrc) {
    return (
      <p className="text-xs text-zinc-400">
        Sprite not configured for stage {stageId}. Check
        getSpriteForLifeStage().
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
        {/* Weather overlay layers */}
        {weather === "rain" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <style>{`@keyframes rainDrop {0%{transform:translateY(-120%);}100%{transform:translateY(120%);}}`}</style>
            {Array.from({ length: 18 }).map((_, i) => (
              <div
                key={i}
                className="absolute bg-emerald-300/40"
                style={{
                  top: "-10%",
                  left: `${(i * 100) / 18}%`,
                  width: "2px",
                  height: "24px",
                  animation: `rainDrop ${1.6 + (i % 5) * 0.2}s linear ${(i % 7) * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
        )}
        {weather === "snow" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <style>{`@keyframes snowFall {0%{transform:translateY(-20%) scale(1);}100%{transform:translateY(110%) scale(0.9);}}`}</style>
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-zinc-100/80"
                style={{
                  top: "-10%",
                  left: `${(i * 100) / 14}%`,
                  width: `${4 + (i % 3)}px`,
                  height: `${4 + (i % 3)}px`,
                  animation: `snowFall ${3 + (i % 4) * 0.6}s linear ${(i % 5) * 0.3}s infinite`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

EnhancedDogSprite.displayName = "EnhancedDogSprite";
EnhancedDogSprite.framework = "react";
EnhancedDogSprite.group = "components";
EnhancedDogSprite.propagateFirebaseReady = false;
EnhancedDogSprite.propagateUser = false;
EnhancedDogSprite.propagateDog = false;
EnhancedDogSprite.defaultSize = { width: 150, height: 150 };
