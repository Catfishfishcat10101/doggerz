// src/components/UI/GameScreen.jsx
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useGameClock from "../../hooks/useGameClock";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import useKeyPressed from "../../hooks/useKeyPressed";
import useJitteredTimer from "../../hooks/useJitteredTimer";
import usePageVisibility from "../../hooks/usePageVisibility";
import useHoldRepeat from "../../hooks/useHoldRepeat";
import DogSprite from "./DogSprite";
import FirebaseAutoSave from "../FirebaseAutoSave";
import barkSfx from "../../assets/audio/bark1.mp3";

import {
  addXP, changeHappiness, selectDirection, selectHappiness, selectMoving,
  selectPos, setDirection, setHappiness, setMoving, setPosition, tickNeeds,
  selectBackyardSkin,
} from "../../redux/dogSlice";

const WORLD_W = 640, WORLD_H = 360, TILE = 64, SPEED = 140;

export default function GameScreen() {
  const dispatch = useDispatch();
  const pos = useSelector(selectPos);
  const dir = useSelector(selectDirection);
  const moving = useSelector(selectMoving);
  const happiness = useSelector(selectHappiness);
  const backyardSkin = useSelector(selectBackyardSkin);

  const audioRef = useRef(null);
  const bark = useCallback(async () => { try { await audioRef.current?.play(); } catch {} }, []);

  const { delta, setSpeed } = useGameClock({ running: true, speed: 1, pauseOnHidden: true });

  const left = useKeyPressed(["arrowleft", "a"]);
  const right = useKeyPressed(["arrowright", "d"]);
  const up = useKeyPressed(["arrowup", "w"]);
  const down = useKeyPressed(["arrowdown", "s"]);

  const { bind: holdPetBind } = useHoldRepeat(() => { dispatch(changeHappiness(+1)); dispatch(addXP(1)); },
    { initialDelay: 200, interval: 80 });

  useKeyboardShortcuts({ b: () => bark(), "shift+.": () => setSpeed(2), ".": () => setSpeed(1) },
    { enabled: true, preventDefault: true });

  useJitteredTimer({ baseMs: 3000, jitter: 0.25, autoStart: true });
  useEffect(() => {
    const id = setInterval(() => { dispatch(tickNeeds({ dtSec: 3 })); if (Math.random() < 0.08) bark(); }, 3000);
    return () => clearInterval(id);
  }, [dispatch, bark]);

  usePageVisibility({ onHide: () => audioRef.current?.pause() });

  useEffect(() => {
    let dx = 0, dy = 0;
    if (left) dx -= 1; if (right) dx += 1; if (up) dy -= 1; if (down) dy += 1;
    const isMoving = dx !== 0 || dy !== 0;
    if (isMoving !== moving) dispatch(setMoving(isMoving));
    if (!isMoving) return;

    if (dx && dy) { const inv = 1 / Math.sqrt(2); dx *= inv; dy *= inv; }
    if (Math.abs(dx) > Math.abs(dy)) dispatch(setDirection(dx < 0 ? "left" : "right"));
    else if (Math.abs(dy) > 0) dispatch(setDirection(dy < 0 ? "up" : "down"));

    const nx = Math.max(0, Math.min(WORLD_W - TILE, pos.x + dx * SPEED * delta));
    const ny = Math.max(0, Math.min(WORLD_H - TILE, pos.y + dy * SPEED * delta));
    if (nx !== pos.x || ny !== pos.y) dispatch(setPosition({ x: nx, y: ny, world: { w: WORLD_W, h: WORLD_H, tile: TILE } }));
  }, [delta, left, right, up, down, pos.x, pos.y, moving, dispatch]);

  const barColor = useMemo(() => (happiness > 66 ? "bg-green-500" : happiness > 33 ? "bg-yellow-500" : "bg-red-500"), [happiness]);

  const worldStyle = useMemo(() => {
    if (backyardSkin === "lush") {
      return {
        width: WORLD_W,
        height: WORLD_H,
        backgroundColor: "#b7f7c5",
        backgroundImage:
          "linear-gradient(0deg,#99f0ae 0 1px,transparent 1px), linear-gradient(90deg,#99f0ae 0 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        border: "2px solid rgba(16,185,129,0.25)",
      };
    }
    // default
    return { width: WORLD_W, height: WORLD_H, backgroundColor: "rgba(6,95,70,0.05)" };
  }, [backyardSkin]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-50 to-emerald-200 flex flex-col items-center">
      <FirebaseAutoSave />
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
          <Link to="/shop" className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95">🛒 Shop</Link>
          <Link to="/train/potty" className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95">🚽 Potty</Link>
          <Link to="/train/tricks" className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95">🎓 Tricks</Link>
          <Link to="/breed" className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95">🐶 Breed</Link>
          <Link to="/stats" className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95">📊 Stats</Link>
          <button {...holdPetBind} className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95">🐶 Pet</button>
          <button onClick={() => { bark(); dispatch(setHappiness(Math.min(100, happiness + 2))); dispatch(addXP(2)); }} className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95">🗣️ Bark</button>
        </div>
      </div>

      {/* World */}
      <div className="w-full max-w-4xl px-4">
        <div className="relative rounded-2xl shadow-inner" style={worldStyle}>
          <div className="absolute transition-transform will-change-transform" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
            <DogSprite size={64} frameWidth={64} frameHeight={64} direction={dir} isWalking={moving} frameCount={4} frameRate={moving ? 10 : 6}/>
          </div>
        </div>
        <p className="mt-3 text-sm text-emerald-900/70">
          Move with Arrow Keys / WASD • Hold <span className="font-mono">.</span> + <span className="font-mono">Shift</span> to speed time • Press <span className="font-mono">B</span> to bark
        </p>
      </div>
    </div>
  );
}
