// src/pages/Game.jsx
import React from "react";
import { Link } from "react-router-dom";
import DogSprite from "@/components/UI/DogSprite.jsx";

export default function GamePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 gap-8">
      <header className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold">Doggerz Game (Shell)</h1>
        <p className="text-zinc-400 max-w-xl">
          This is your temporary game screen. Sprite is live. Next step is to
          drop in the full HUD, DogAIEngine, and Firestore autosave.
        </p>
      </header>

      <section className="flex flex-col items-center gap-4">
        {/* í´¥ Fireball on stage */}
        <DogSprite direction="down" />

        <p className="text-xs text-zinc-500">
          Direction prop can be: <code>left</code>, <code>right</code>,{" "}
          <code>up</code>, <code>down</code>. We&apos;ll wire this to AI later.
        </p>
      </section>

      <nav className="flex gap-3 mt-8">
        <Link
          to="/splash"
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium border border-zinc-600 text-zinc-200 hover:bg-zinc-800"
        >
          â¬… Back to Splash
        </Link>
        <Link
          to="/adopt"
          className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium bg-emerald-500 text-emerald-950 hover:bg-emerald-400"
        >
          Adopt / Rename Pup
        </Link>
      </nav>
    </div>
  );
}
