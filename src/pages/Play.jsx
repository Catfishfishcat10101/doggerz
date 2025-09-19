// src/pages/Play.jsx
import React from "react";
import GameScreen from "../components/UI/GameScreen";
import StatsBar from "../components/UI/StatsBar";
import Controls from "../components/UI/Controls";
import DogPanel from "../components/Features/Dog";
import { addXP, setHappiness } from "../redux/dogSlice";

export default function Play() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100">
      <h1 className="sr-only">Play</h1>

      <GameScreen
        // LEFT HUD — Stats bar already reads from Redux; no props needed.
        renderHUDLeft={() => <StatsBar label="Happiness" compact />}

        // RIGHT HUD — use ctx (from GameScreen) instead of hooks here.
        renderHUDRight={({ bark, setSpeed, holdPetBind, dispatch, happiness }) => (
          <div className="flex items-center gap-2">
            {/* Your existing Controls (still fine if it's the basic version) */}
            <Controls />

            {/* Action buttons that do not depend on Controls' API */}
            <button
              onClick={async () => {
                await bark();
                dispatch(setHappiness(Math.min(100, (happiness ?? 0) + 2)));
                dispatch(addXP(2));
              }}
              className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
              title="Bark"
            >
              🗣️ Bark
            </button>

            {/* Hold-to-pet using the bind object provided by GameScreen */}
            <button
              {...holdPetBind}
              className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
              title="Hold to pet"
            >
              🐶 Pet
            </button>

            {/* Time controls driven by GameScreen's clock */}
            <button
              onClick={() => setSpeed(1)}
              className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
              title="Normal time"
            >
              ⏱️ 1×
            </button>
            <button
              onClick={() => setSpeed(2)}
              className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
              title="Fast time"
            >
              ⚡ 2×
            </button>
          </div>
        )}

        // BELOW WORLD — richer panel without touching game loop
        renderBelowWorld={() => (
          <>
            <div className="mt-3 text-sm text-emerald-900/70">Good dog. Keep training.</div>
            <DogPanel />
          </>
        )}

        // OVERLAY — lightweight debug
        renderOverlay={({ pos, moving }) => (
          <div className="absolute left-2 top-2 bg-white/70 rounded-lg px-2 py-1 text-xs text-emerald-900 shadow">
            x:{Math.round(pos.x)} y:{Math.round(pos.y)} {moving ? "• walking" : "• idle"}
          </div>
        )}

        // Optional hooks — safe no-ops
        onSpeedChange={(speed) => console.debug("speed =", speed)}
        onMove={() => {}}
        onBark={() => {}}
        onTickNeeds={() => {}}
      />
    </main>
  );
}
