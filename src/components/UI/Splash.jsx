// src/components/UI/Splash.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-amber-200 to-amber-400">
      <div className="text-center">
        <img
          src="/backgrounds/yard_day.png"
          alt="Doggerz yard"
          className="w-48 h-48 object-cover rounded-full mx-auto shadow-lg mb-6 border-4 border-white"
        />
        <h1 className="text-5xl font-extrabold text-yellow-800 drop-shadow mb-2">
          🐾 Doggerz
        </h1>
        <p className="text-lg text-yellow-900 mb-6">
          The most realistic virtual dog sim—raise, train, love, and play!
        </p>
        <button
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 rounded-xl shadow font-bold text-xl transition"
          onClick={() => navigate("/game")}
        >
          Start Game
        </button>
      </div>
      <footer className="mt-16 text-yellow-800/80 text-xs">
        &copy; {new Date().getFullYear()} Doggerz. All rights reserved.
      </footer>
    </div>
  );
}
