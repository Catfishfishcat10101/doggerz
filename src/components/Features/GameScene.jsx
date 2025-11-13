// src/components/Features/GameScene.jsx
import React from "react";
import BackgroundScene from "@/components/Features/BackgroundScene.jsx";
import DogSpriteView from "@/components/Features/DogSpriteView.jsx";
import DogAIEngine from "@/components/Features/DogAIEngine.jsx";

export default function GameScene() {
  return (
    <div
      className="
        relative mx-auto
        w-full max-w-[480px]
        aspect-[3/2]
        rounded-2xl overflow-hidden
        border border-slate-800/70
        shadow-[0_0_40px_rgba(0,0,0,0.75)]
        bg-black
      "
    >
      <div className="absolute inset-0">
        <BackgroundScene />
      </div>
      <div className="absolute inset-0">
        <DogSpriteView />
      </div>

      {/* headless game loop */}
      <DogAIEngine />
    </div>
  );
}
