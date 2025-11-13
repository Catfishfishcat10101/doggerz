// src/pages/Game.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function GamePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-50 px-4">
      <h1 className="text-3xl md:text-4xl font-bold mb-4">Doggerz Game (Shell)</h1>
      <p className="text-zinc-400 mb-6 text-center max-w-xl">
        This is a temporary game screen. Next step is to drop your real Dog
        component, needs HUD, and DogAIEngine in here and hook it to Redux +
        Firestore.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-100 transition"
      >
        ⟵ Back to splash
      </Link>
    </div>
  );
}