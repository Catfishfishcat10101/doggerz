// src/pages/Game.jsx
// @ts-nocheck

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectDog,
  selectDogLifeStage,
  feed,
  play,
  bathe,
  goPotty,
  trainObedience,
} from "@/redux/dogSlice.js";

import EnhancedDogSprite from "@/components/EnhancedDogSprite.jsx";
import ProgressBar from "@/components/ProgressBar.jsx";
import VoiceCommandButton from "@/components/VoiceCommandButton.jsx";

export default function GamePage() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);
  const stage = useSelector(selectDogLifeStage);

  const {
    name,
    level,
    hunger,
    happiness,
    energy,
    cleanliness,
    obedience,
  } = dog;

  return (
    <div className="flex flex-col items-center w-full h-full pt-4 pb-10 overflow-y-auto bg-gradient-to-b from-zinc-950 to-zinc-900 text-white">

      {/* Top Title */}
      <div className="flex flex-col items-center mb-4">
        <h1 className="text-4xl font-bold tracking-wide text-emerald-400 drop-shadow-lg">
          DOGGERZ
        </h1>
        <p className="text-sm text-zinc-300 mt-1">Virtual Pup Simulator</p>
      </div>

      {/* Dog Name + Stage */}
      <div className="mt-2 mb-1 text-center">
        <h2 className="text-xl font-semibold">{name}</h2>
        <p className="text-sm text-zinc-400">{stage.label}</p>
      </div>

      {/* Dog Sprite */}
      <div className="scale-110 mt-4">
        <EnhancedDogSprite />
      </div>

      {/* Stats */}
      <div className="w-72 mt-6 space-y-4">
        <ProgressBar label="Hunger" value={hunger} />
        <ProgressBar label="Happiness" value={happiness} />
        <ProgressBar label="Energy" value={energy} />
        <ProgressBar label="Cleanliness" value={cleanliness} />
        <ProgressBar label="Training" value={obedience} />
      </div>

      {/* Care Buttons */}
      <div className="mt-8 grid grid-cols-2 gap-4 w-72">
        <button
          onClick={() => dispatch(feed())}
          className="py-2 bg-emerald-600/70 rounded-lg shadow hover:bg-emerald-600"
        >
          Feed
        </button>

        <button
          onClick={() => dispatch(play())}
          className="py-2 bg-blue-600/70 rounded-lg shadow hover:bg-blue-600"
        >
          Play
        </button>

        <button
          onClick={() => dispatch(goPotty())}
          className="py-2 bg-yellow-600/70 rounded-lg shadow hover:bg-yellow-600"
        >
          Potty
        </button>

        <button
          onClick={() => dispatch(bathe())}
          className="py-2 bg-indigo-600/70 rounded-lg shadow hover:bg-indigo-600"
        >
          Bathe
        </button>

        <button
          onClick={() => dispatch(trainObedience())}
          className="col-span-2 py-2 bg-purple-600/70 rounded-lg shadow hover:bg-purple-600"
        >
          Train
        </button>
      </div>

      {/* Voice Command */}
      <div className="mt-6">
        <VoiceCommandButton />
      </div>

      {/* Level Up Shortcut */}
      <div className="mt-8">
        <button className="px-6 py-2 bg-emerald-700 rounded-xl shadow-lg hover:bg-emerald-600">
          Level Up (test)
        </button>
      </div>
    </div>
  );
}
