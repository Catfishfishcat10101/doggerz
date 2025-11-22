// src/features/game/DogSpriteView.jsx
// @ts-nocheck

import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import EnhancedDogSprite from "@/components/EnhancedDogSprite.jsx";

/**
 * DogSpriteView
 *
 * Renders the dog sprite + name + status, positioned inside the game stage.
 * This assumes the parent container (GameScene) is `position: relative`,
 * and this component is layered on top as an overlay.
 */
export default function DogSpriteView() {
  const dog = useSelector(selectDog);

  if (!dog) return null;

  const { name, isAsleep } = dog;
  const statusLabel = isAsleep ? "Sleeping…" : "Ready to play";

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-end pb-16 gap-3">
      {/* Animated sprite strip / PNG logic lives in EnhancedDogSprite */}
      <EnhancedDogSprite />

      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">
          {statusLabel}
        </p>
        <p className="text-lg sm:text-xl font-semibold tracking-wide">
          {name || "Pup"}
        </p>
      </div>
    </div>
  );
}
