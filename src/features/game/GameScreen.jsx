// src/features/game/GameScreen.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

// compose from what you already have
import Dog from "@/components/Features/Dog"; // the keyboard-walk Dog feature we made
import BackgroundScene from "@/components/Features/BackgroundScene";
import PoopRenderer from "@/components/Features/PoopRenderer";
import SettingsModal from "@/components/Features/SettingsModal";
import NeedsHUD from "../NeedsHUD";
import useGameLoop from "./useGameLoop";
import LogoutButton from "@/components/Auth/LogoutButton";

export default function GameScreen() {
  // kick off passive systems (stat ticks, cleanliness updates, etc.)
  useGameLoop();

  const dog = useSelector((s) => s.dog);
  const [showSettings, setShowSettings] = React.useState(false);

  return (
    <div className="min-h-screen bg-[#0b1020] text-white flex flex-col items-center">
      {/* Top bar */}
      <header className="w-full max-w-5xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-extrabold tracking-wide">🐾 Doggerz</h1>
          <span className="text-white/70">
            Lv {dog.level} • XP {dog.xp}/{dog.level * 100}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/shop"
            className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-black font-semibold"
          >
            Shop
          </Link>
          <button
            onClick={() => setShowSettings(true)}
            className="px-3 py-1 rounded bg-white/10 hover:bg-white/20"
            aria-label="Open settings"
          >
            ⚙️
          </button>
          <LogoutButton className="ml-2" />
        </div>
      </header>

      {/* Yard + dog */}
      <main className="w-full max-w-5xl px-4 grid lg:grid-cols-[2fr_1fr] gap-6">
        <section className="space-y-3">
          <BackgroundScene scene="yard_day" />
          {/* Dog renders on its own yard container (internal) */}
          <Dog />
        </section>

        {/* Right rail: HUD + actions/links */}
        <aside className="space-y-3">
          <NeedsHUD />
          <div className="bg-white/5 rounded-xl p-4">
            <h3 className="font-semibold mb-2">Quick Links</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/affection"
                className="px-3 py-1 rounded bg-pink-400 hover:bg-pink-500 text-black font-semibold"
              >
                Affection
              </Link>
              <Link
                to="/memory"
                className="px-3 py-1 rounded bg-blue-400 hover:bg-blue-500 text-black font-semibold"
              >
                Memories
              </Link>
              <Link
                to="/potty"
                className="px-3 py-1 rounded bg-lime-400 hover:bg-lime-500 text-black font-semibold"
              >
                Potty
              </Link>
              <Link
                to="/upgrade"
                className="px-3 py-1 rounded bg-green-400 hover:bg-green-500 text-black font-semibold"
              >
                Yard Upgrades
              </Link>
            </div>
          </div>

          {/* Visible poop map & cleanup */}
          <PoopRenderer />
        </aside>
      </main>

      {showSettings && (
        <SettingsModal isOpen onClose={() => setShowSettings(false)} />
      )}
    </div>
  );
}
