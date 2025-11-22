// src/pages/Game.jsx

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

import DogAIEngine from "@/features/game/DogAIEngine.jsx";
import MainGame from "@/features/game/MainGame.jsx";

export default function Game() {
  const dog = useSelector(selectDog);

  useEffect(() => {
    document.title = "Doggerz • Main Game";
  }, []);

  return (
    <>
      {/* Background AI loop / timers – invisible, just runs logic */}
      {dog && <DogAIEngine />}

      {/* Main game owns the whole layout / screen */}
      <MainGame />
    </>
  );
}
