import React from "react";
import DogSprite from "@features/DogSprite";

export default function Splash() {
  return (
    <main className="min-h-dvh grid place-items-center bg-gradient-to-b from-sky-900 to-slate-950 text-white">
      <section className="flex flex-col items-center gap-6 p-8">
        <h1 className="text-4xl font-black tracking-tight drop-shadow-sm">
          Doggerz
        </h1>

        {/* Sprite preview */}
        <div className="rounded-2xl bg-black/30 p-4 ring-1 ring-white/10">
          <DogSprite
            width={96}
            height={96}
            fps={10}
            state="idle"   // "idle" | "walk" | "sleep" (see DogSprite below)
          />
        </div>

        <p className="text-white/80">
          Loading assets… grab your leash! 🦴
        </p>
      </section>
    </main>
  );
}