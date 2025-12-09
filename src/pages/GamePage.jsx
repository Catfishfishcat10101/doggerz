import React from "react";
import MainGame from "../features/game/MainGame";

export default function GamePage() {
  return (
    <div className="content">
      <h2 className="text-2xl font-semibold mb-4">Play with your dog</h2>
      <MainGame />
    </div>
  );
}
