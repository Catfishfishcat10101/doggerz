import React from "react";
import { HelmetProvider } from "react-helmet-async";
import DogSprite from "./Dog/DogSprite";
import DogName from "./Dog/DogName";
import Controls from "./Controls";
import StatsBar from "./Stats/StatsBar";
import CleanlinessBar from "./Stats/CleanlinessBar";
import Tricks from "./Training/Tricks";
import PoopRenderer from "../Features/PoopRenderer";
import LogoutButton from "../Auth/LogoutButton";
import PottyTraining from "./Training/PottyTraining";
import Status from "./Stats/Status";
import ToyBox from "./ToyBox";
import DogAIEngine from "./Dog/DogAIEngine";

function MainGame() {
  return (
    <div className="relative w-screen h-screen bg-green-100 overflow-hidden font-sans">
      {/* 🧠 AI Engine */}
      <DogAIEngine />
      {/* Helmet for SEO */}
      <HelmetProvider>
        <title>Doggerz - Main Game</title>
        <meta name="description" content="Play with your virtual dog in Doggerz!" />
      </HelmetProvider> 
    

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
