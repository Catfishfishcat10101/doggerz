// src/pages/Game.jsx
// @ts-nocheck

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

import DogAIEngine from "@/features/game/DogAIEngine.jsx";
import MainGame from "@/features/game/MainGame.jsx";
import { bootstrapDogState } from "@/redux/dogThunks.js";

export default function Game() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  // On first visit to /game, hydrate dog from localStorage and tick needs
  useEffect(() => {
    dispatch(bootstrapDogState());
  }, [dispatch]);

  useEffect(() => {
    document.title = dog?.name
      ? `Doggerz • ${dog.name}'s yard`
      : "Doggerz • Main Game";
  }, [dog?.name]);

  return (
    <main className="min-h-[calc(100vh-4rem)] px-4 py-8 flex justify-center text-slate-50">
      {/* Background AI loop / timers – invisible, just runs logic */}
      {dog && <DogAIEngine />}

      {/* Main game content */}
      <div className="w-full max-w-6xl">
        <MainGame />
      </div>
    </main>
  );
}
