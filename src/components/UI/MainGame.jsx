import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import DogSprite from "./Dog/DogSprite";
import DogName from "./Dog/DogName";
import StatsBar from "./Stats/StatsBar";
import CleanlinessBar from "./Stats/CleanlinessBar";
import Status from "./Stats/Status";
import PottyTraining from "./Training/PottyTraining";
import Tricks from "./Training/Tricks";
import Controls from "./Controls";
import ToyBox from "./ToyBox";
import DogAIEngine from "./Dog/DogAIEngine";
import LogoutButton from "./LogoutButton";
import PoopRenderer from "../Features/PoopRenderer"; // Assuming this is a component that handles poop rendering in the d
import { selectIsLoggedIn } from "../Features/authSlice"; // Adjust the import path as necessary
import "../styles/mainGame.css"; // Assuming you have a CSS file for styles
import "../styles/controls.css"; // Assuming you have a CSS file for controls styles
import "../styles/toybox.css"; // Assuming you have a CSS file for toybox styles
import "../styles/dog.css"; // Assuming you have a CSS file for dog styles
import "../styles/stats.css"; // Assuming you have a CSS file for stats styles
import "../styles/pottyTraining.css"; // Assuming you have a CSS file for potty training styles
import "../styles/tricks.css"; // Assuming you have a CSS file for tricks styles



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
      {/* AI Engine */}
        <DogAIEngine />
      {/* Logout Button */}
      <div className="absolute top-4 right-4 z-50">
        <LogoutButton />
      </div>
      {/* Dog Name */}
      <div className="absolute top-4 left-4 z-40">
        <DogName />
      </div>
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-green-200 to-green-300">
        {/* You can add a background image or gradient here */}
      </div>
      {/* Main Game Area */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <div className="w-full h-full bg-white rounded-lg shadow-lg p-4 overflow-auto">
          {/* Main game content goes here */}
          <h1 className="text-2xl font-bold text-center mb-4">
            Welcome to Doggerz!
          </h1>
          <p className="text-center">
            Play with your virtual dog, train it, and have fun!
          </p>
        </div>
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
};

export default MainGame;