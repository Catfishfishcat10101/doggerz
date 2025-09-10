// src/components/UI/GameScreen.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useGameClock from "../../hooks/useGameClock";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import useKeyPressed from "../../hooks/useKeyPressed";
import useJitteredTimer from "../../hooks/useJitteredTimer";
import usePageVisibility from "../../hooks/usePageVisibility";
import useHoldRepeat from "../../hooks/useHoldRepeat";
import DogSprite from "./DogSprite";

import barkSfx from "../../assets/audio/bark1.mp3";

const WORLD_W = 640;
const WORLD_H = 360;
const SPEED = 140; // px/sec

export default function GameScreen() {
  // World state
  const [pos, setPos] = useState({ x: 320, y: 180 });
  const [dir, setDir] = useState("down");
  const [moving, setMoving] = useState(false);
  const [happiness, setHappiness] = useState(75);

  // Audio
  const audioRef = useRef(null);
  const bark = useCallback(async () => {
    try {
      await audioRef.current?.play();
    } catch {}
  }, []);

  // Clock
  const { delta, setSpeed } = useGameClock({ running: true, speed: 1, pauseOnHidden: true });

  // Key states (continuous)
  const left = useKeyPressed(["arrowleft", "a"]);
  const right = useKeyPressed(["arrowright", "d"]);
  const up = useKeyPressed(["arrowup", "w"]);
  const down = useKeyPressed(["arrowdown", "s"]);

  // Pet button: hold to boost happiness
  const { bind: holdPetBind } = useHoldRepeat(
    () => setHappiness((h) => Math.min(100, h + 1)),
    { initialDelay: 200, interval: 80 }
  );

  // Keyboard shortcuts (single actions)
  useKeyboardShortcuts(
    {
      b: () => bark(),
      // fast-forward sim time while holding Shift
      "shift+.": () => setSpeed(2),
      ".": () => setSpeed(1),
    },
    { enabled: true, preventDefault: true, allowRepeat: false }
  );

  // Idle “life” ticks for tiny happiness decay (and occasional bark)
  const tickRef = useRef(0);
  useJitteredTimer({ baseMs: 3000, jitter: 0.25, autoStart: true });
  useEffect(() => {
    const id = setInterval(() => {
      tickRef.current++;
      setHappiness((h) => Math.max(0, h - 1));
      if (Math.random() < 0.08) bark();
    }, 3000);
    return () => clearInterval(id);
  }, [bark]);

  // Pause audio when hidden
  usePageVisibility({
    onHide: () => audioRef.current?.pause(),
  });

  // Movement integration with clock delta
  useEffect(() => {
    let dx = 0,
      dy = 0;

    if (left) dx -= 1;
    if (right) dx += 1;
    if (up) dy -= 1;
    if (down) dy += 1;

    const isMoving = dx !== 0 || dy !== 0;
    setMoving(isMoving);

    if (!isMoving) return;

    // normalize diagonal
    if (dx && dy) {
      const inv = 1 / Math.sqrt(2);
      dx *= inv;
      dy *= inv;
    }

    // choose facing from last input priority
    if (Math.abs(dx) > Math.abs(dy)) setDir(dx < 0 ? "left" : "right");
    else if (Math.abs(dy) > 0) setDir(dy < 0 ? "up" : "down");

    setPos((p) => {
      const nx = Math.max(0, Math.min(WORLD_W - 64, p.x + dx * SPEED * delta));
      const ny = Math.max(0, Math.min(WORLD_H - 64, p.y + dy * SPEED * delta));
      return { x: nx, y: ny };
    });
  }, [delta, left, right, up, down]);

  const barColor = useMemo(() => {
    if (happiness > 66) return "bg-green-500";
    if (happiness > 33) return "bg-yellow-500";
    return "bg-red-500";
  }, [happiness]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-50 to-emerald-200 flex flex-col items-center">
      <audio ref={audioRef} src={barkSfx} preload="auto" />
      {/* HUD */}
      <div className="w-full max-w-4xl px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-emerald-900">Happiness</span>
          <div className="w-48 h-3 bg-emerald-900/10 rounded">
            <div className={`h-3 ${barColor} rounded`} style={{ width: `${happiness}%` }} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            {...holdPetBind}
            className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
            title="Hold to pet!"
          >
            🐶 Pet
          </button>
          <button
            onClick={bark}
            className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
            title="Bark (B)"
          >
            🗣️ Bark
          </button>
        </div>
      </div>

      {/* World */}
      <div className="w-full max-w-4xl px-4">
        <div
          className="relative rounded-2xl bg-emerald-900/5 shadow-inner"
          style={{ width: WORLD_W, height: WORLD_H }}
        >
          {/* dog */}
          <div
            className="absolute transition-transform will-change-transform"
            style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
          >
            <DogSprite
              size={64}
              frameWidth={64}
              frameHeight={64}
              direction={dir}
              isWalking={moving}
              frameCount={4}
              frameRate={moving ? 10 : 6}
            />
          </div>

          {/* simple “tiles” or objects could be layered here later */}
        </div>

        <p className="mt-3 text-sm text-emerald-900/70">
          Move with Arrow Keys / WASD • Hold <span className="font-mono">.</span> + <span className="font-mono">Shift</span> to speed time • Press <span className="font-mono">B</span> to bark
        </p>
      </div>
    </div>
  );
}
