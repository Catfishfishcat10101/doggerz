// @ts-nocheck
// src/pages/GamePage.jsx
//
// Route-level wrapper for the main Doggerz gameplay screen.
// The real game logic/UI lives in src/features/game/MainGame.jsx.

import React from "react";
import MainGame from "@/features/game/MainGame.jsx";

export default function GamePage() {
  return (
    <div className="w-full h-full flex items-stretch justify-center">
      {/* MainGame handles backyard background, dog sprite, stats, actions, etc. */}
      <MainGame />
    </div>
  );
}
