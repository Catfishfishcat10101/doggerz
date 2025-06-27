// src/components/MainGame.jsx
import React, { useState } from "react";
import DogSpriteCanvas from "./Features/DogSpriteCanvas";
import Dog             from "./Features/Dog";        // choose one or both
import StatsBar        from "./UI/StatsBar";          // assume you have these
import Controls        from "./UI/Controls";
import CleanlinessBar  from "./UI/CleanlinessBar";

const MainGame = () => {
  const [showCanvas, setShowCanvas] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <StatsBar />
      {/* toggle which renderer you prefer */}
      {showCanvas ? <DogSpriteCanvas /> : <Dog />}
      <CleanlinessBar />
      <Controls onRendererToggle={() => setShowCanvas(s => !s)} />
    </div>
  );
};

export default MainGame;