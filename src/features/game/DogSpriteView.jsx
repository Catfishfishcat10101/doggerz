// src/features/game/DogSpriteView.jsx
// @ts-nocheck

import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";
import EnhancedDogSprite from "@/utils/EnhancedDogSprite.jsx";

export default function DogSpriteView() {
  const dog = useSelector(selectDog);

  if (!dog) return null;

  const statusLabel = dog.isAsleep ? "Sleeping…" : "Ready to play";

  return (
    <div className="relative flex flex-col items-center gap-3">
      {/* Centralized sprite logic lives in EnhancedDogSprite */}
      <EnhancedDogSprite />

      <div className="text-center space-y-1">
        <p className="text-xs uppercase tracking-[0.25em] text-emerald-300/80">
          {statusLabel}
        </p>

        <p className="text-lg sm:text-xl font-semibold tracking-wide">
          {dog.name || "Pup"}
        </p>
      </div>
    </div>
  );
}
