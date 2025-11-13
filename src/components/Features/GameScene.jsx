import React from "react";
import BackgroundScene from "@/Features/BackgroundScene.jsx";
import DogSpriteView from "@/Features/DogSpriteView.jsx";
import DogAIEngine from "@/Features/DogAIEngine.jsx";

export default function GameScene() {
  return (
    <div className="relative w-[480px] h-[320px] mx-auto">
      <div className="absolute inset-0"><BackgroundScene /></div>
      <div className="absolute inset-0"><DogSpriteView /></div>
      <DogAIEngine />
    </div>
  );
}