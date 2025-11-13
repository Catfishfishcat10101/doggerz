// src/pages/Game.jsx
import React from "react";
import GameScene from '@/features/game/GameScene.jsx';

export default function GamePage () {
  return (
    <main className="min-h=screen bg-slate-950 text-slate-50">
    <GameScene />
    </main>
  );
}