// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Adopt from "./pages/Adopt.jsx";
import MainGame from "./features/game/MainGame.jsx";

function LandingScreen() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/adopt");
  };

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 flex flex-col">
      <header className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-[11px] uppercase tracking-[0.28em] text-emerald-400/90">
              Adopt. Train. Bond.
            </span>
            <span className="text-3xl font-extrabold tracking-tight text-white">
              Doggerz
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 lg:py-16 grid gap-10 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)] items-start">
          <section>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-400 mb-3">
              Adopt. Train. Bond.
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white mb-4">
              Your <span className="text-emerald-400">virtual pup</span>,<br />
              always one tap away.
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-6">
              Adopt your pup and take care of them over real time. Keep them
              fed, entertained, rested, and clean. How you treat your dog
              determines how long they live — no click-spamming, no idle mining.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-4">
              <button
                type="button"
                onClick={handleGetStarted}
                className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-semibold px-6 py-2.5 transition shadow-card"
              >
                Get started
              </button>
            </div>
          </section>

          <aside className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 text-sm shadow-card">
            <h2 className="text-xs uppercase tracking-[0.28em] text-emerald-400 font-semibold mb-3">
              How Doggerz works
            </h2>

            <ul className="space-y-3 text-slate-100 text-xs sm:text-sm">
              <li>• Your dog slowly ages even while you&apos;re logged out.</li>
              <li>
                • Hunger, boredom, and dirtiness creep up over real hours, not
                button mashing.
              </li>
              <li>
                • As cleanliness drops, your pup can go from dirty → fleas →
                mange.
              </li>
              <li>• Taking good care of your pup extends their life.</li>
            </ul>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingScreen />} />
      <Route path="/adopt" element={<Adopt />} />
      <Route path="/play" element={<MainGame />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
