// src/App.jsx
import React from "react";
import { Routes, Route, Link } from "react-router-dom";

// 👉 this is your REAL game screen, not a placeholder
import MainGame from "./features/game/MainGame.jsx";

function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-zinc-50">
      <div className="w-full max-w-xl mx-auto px-4 text-center space-y-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Doggerz
        </h1>
        <p className="text-zinc-400">
          Adopt your virtual pup and keep their stats up. This splash is real
          now, not a throwaway.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link
            to="/game"
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-zinc-950 transition"
          >
            Start Game
          </Link>
        </div>

        <p className="text-xs text-zinc-500 mt-4">
          We&apos;ll plug auth and the rest of your layout back in after the
          main game screen is solid.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/game" element={<MainGame />} />
      {/* anything unknown kicks back to splash */}
      <Route path="*" element={<Splash />} />
    </Routes>
  );
}