// src/pages/Splash.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Splash() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1020] text-white">
      <div className="w-full max-w-xl mx-auto px-6 text-center space-y-8">
        
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
          Welcome to Doggerz
        </h1>

        <p className="text-white/70 leading-relaxed max-w-prose mx-auto">
          Adopt, train, feed, and raise your virtual pup.  
          Where fun, chaos, and loyalty meet—minus all the chewed phone chargers.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          
          {/* START GAME */}
          <Link
            to="/game"
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold 
                       bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition shadow"
          >
            Start Game
          </Link>

          {/* ADOPT A NEW PUP */}
          <Link
            to="/adopt"
            className="inline-flex items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold 
                       border border-emerald-500 text-emerald-300 hover:bg-emerald-900/40 transition"
          >
            Adopt a New Pup
          </Link>
        </div>

        <p className="text-xs text-white/50 mt-6">
          Cloud saving, achievements, and Google login will activate here soon.
        </p>
      </div>
    </div>
  );
}
