// src/pages/GamePage.jsx
// @ts-nocheck

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import MainGame from "@/features/game/MainGame.jsx";
import YardBackground from "@/components/YardBackground.jsx";
import { ensureDogMain } from "@/firebase/ensureDog.js";
import DogAIEngine from "@/features/game/DogAIEngine.jsx";

/**
 * Route-level wrapper for the main Doggerz gameplay screen.
 * Renders a smooth day/night yard background behind the UI.
 */
export default function GamePage() {
  const uid = useSelector((s) => s.auth?.user?.uid);

  useEffect(() => {
    if (!uid) return;
    ensureDogMain(uid).catch((e) =>
      console.warn("[Doggerz] ensureDogMain failed:", e),
    );
  }, [uid]);

  return (
    <main className="min-h-screen w-full relative bg-black text-white overflow-hidden">
      <YardBackground />
      <DogAIEngine />
      <div className="relative z-10 min-h-screen w-full flex items-center justify-center">
        <MainGame />
      </div>
    </main>
  );
}
