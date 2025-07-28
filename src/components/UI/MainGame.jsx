import React from "react";
import DogSprite from "./DogSprite";
import DogName from "./DogName";
import Controls from "./Controls";
import StatsBar from "./StatsBar";
import CleanlinessBar from "./CleanlinessBar";
import Tricks from "./Tricks";
import LogoutButton from "../Auth/LogoutButton";
import PottyTraining from "./PottyTraining";
import Status from "./Status";
import ToyBox from "./ToyBox";
import DogAIEngine from "./DogAIEngine";

function MainGame() {
  return (
    <div className="relative w-screen h-screen bg-green-100 overflow-hidden font-sans">
      {/* 🧠 AI Engine */}
      <DogAIEngine />

      {/* Logout Button */}
      <div className="absolute top-4 right-4 z-50">
        <LogoutButton />
      </div>

      {/* Dog Name */}
      <div className="absolute top-4 left-4 z-40">
        <DogName />
      </div>

      {/* HUD Stats */}
      <div className="absolute top-20 left-4 z-40">
        <StatsBar />
        <CleanlinessBar />
      </div>

      {/* Status Messages */}
      <div className="absolute top-40 left-4 z-40">
        <Status />
      </div>

      {/* Potty Training */}
      <div className="absolute inset-0 z-10">
        <PottyTraining />
      </div>

      {/* Dog Canvas & Poop Layer */}
      <div className="absolute inset-0 z-10">
        <DogSprite />
        <PoopRenderer />
      </div>

      {/* Tricks Display */}
      <div className="absolute bottom-20 right-4 z-30">
        <Tricks />
      </div>

      {/* Toybox */}
      <div className="absolute bottom-36 right-4 z-30">
        <ToyBox />
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
        <Controls />
      </div>
    </div>
  );
}

export default MainGame;
