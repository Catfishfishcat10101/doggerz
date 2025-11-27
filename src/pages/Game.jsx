// src/pages/Game.jsx
// Doggerz: Main game screen.

import React from "react";
import MainGame from "@/features/game/MainGame.jsx";
import DogAIEngine from "@/features/game/DogAIEngine.jsx";
import PageContainer from "@/features/game/components/PageContainer.jsx";

export default function GamePage() {
  return (
    <>
      <DogAIEngine />
      <PageContainer title="Yard">
        <MainGame />
      </PageContainer>
    </>
  );
}
