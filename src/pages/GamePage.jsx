// src/pages/GamePage.jsx

import { useEffect } from "react";
import { useSelector } from "react-redux";
import MainGame from "@/features/game/MainGame.jsx";
import YardBackground from "@/components/YardBackground.jsx";
import DogAIEngine from "@/features/game/DogAIEngine.jsx";
import { ensureDogMain } from "@/firebase/ensureDog.js";
import { firebaseReady } from "@/firebase.js";

export default function GamePage() {
  // Use a typed selector to fix TS error
  const uid = useSelector((s) => s.auth?.user?.uid);

  useEffect(() => {
    if (!uid || !firebaseReady) return;
    ensureDogMain(uid).catch((e) =>
      console.warn("[Doggerz] ensureDogMain failed:", e)
    );
  }, [uid]);

  return (
    <main className="min-h-dvh w-full relative bg-black text-white overflow-hidden">
      <YardBackground />
      <DogAIEngine />

      <div className="relative z-10 min-h-dvh w-full flex items-center justify-center">
        <MainGame />
      </div>
    </main>
  );
}
