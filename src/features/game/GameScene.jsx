// src/features/game/GameScene.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

import DogSpriteView from "./DogSpriteView.jsx";
import DogAIEngine from "./DogAIEngine.jsx";
import NeedsHUD from "./NeedsHUD.jsx"

/**
 * GameScene
 *
 * This is the main playfield window. It:
 * - renders the background
 * - positions the dog based on dog.pos.x / dog.pos.y
 * - includes the AI engine for behavior + movement
 * - includes HUD for hunger / happiness / cleanliness / energy
 *
 * Designed for 320px scene width to match DogAIEngine.
 */
export default function GameScene() {
  const dog = useSelector(selectDog);

  const sceneWidth = 320;
  const sceneHeight = 240;

  return (
    <div className="relative w-full flex flex-col items-center justify-start pt-6">

      {/* ============================
          BACKGROUND SCENE
      ============================ */}
      <div
        className="relative overflow-hidden rounded-xl shadow-lg border border-slate-800"
        style={{
          width: sceneWidth + "px",
          height: sceneHeight + "px",
          backgroundImage: "linear-gradient(to top, #0f172a 0%, #1e293b 45%, #0b1120 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >

        {/* ============================
            DOG AI ENGINE (logic only)
        ============================ */}
        <DogAIEngine />

        {/* ============================
            DOG SPRITE POSITIONING
        ============================ */}
        <div
          className="absolute bottom-4"
          style={{
            left: `${dog.pos.x}px`,
            transform: "translateX(-50%)",
            pointerEvents: "none",
          }}
        >
          <DogSpriteView />
        </div>
      </div>

      {/* ============================
          HUD PANEL UNDER PLAYFIELD
      ============================ */}
      <div className="w-full max-w-xs mt-6">
        <NeedsHUD />
      </div>
    </div>
  );
}
