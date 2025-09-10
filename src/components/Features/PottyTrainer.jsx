// src/components/Features/PottyTrainer.jsx
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import useGameClock from "../../hooks/useGameClock";
import useKeyPressed from "../../hooks/useKeyPressed";
import useKeyboardShortcuts from "../../hooks/useKeyboardShortcuts";
import DogSprite from "../UI/DogSprite";
import {
  addXP,
  changeBladder,
  changeHappiness,
  selectBladder,
  selectDirection,
  selectPos,
  setDirection,
  setMilestone,
  setMoving,
  setPosition,
  pottyAccident,
  pottyProgress,
} from "../../redux/dogSlice";

const WORLD_W = 640, WORLD_H = 360, TILE = 64;
const YARD_X_START = 7 * TILE; // tiles 7-9 = outside "grass" zone

export default function PottyTrainer() {
  const dispatch = useDispatch();
  const pos = useSelector(selectPos);
  const dir = useSelector(selectDirection);
  const bladder = useSelector(selectBladder);

  // movement
  const left = useKeyPressed(["arrowleft", "a"]);
  const right = useKeyPressed(["arrowright", "d"]);
  const up = useKeyPressed(["arrowup", "w"]);
  const down = useKeyPressed(["arrowdown", "s"]);
  const { delta } = useGameClock({ running: true, speed: 1 });

  // speed in trainer, slower for precision
  const SPEED = 110;

  // per-frame movement
  useEffect(() => {
    let dx = 0, dy = 0;
    if (left) dx -= 1; if (right) dx += 1; if (up) dy -= 1; if (down) dy += 1;
    const moving = dx || dy;
    dispatch(setMoving(!!moving));
    if (!moving) return;

    if (dx && dy) { const inv = 1 / Math.sqrt(2); dx *= inv; dy *= inv; }
    if (Math.abs(dx) > Math.abs(dy)) dispatch(setDirection(dx < 0 ? "left" : "right"));
    else if (Math.abs(dy) > 0) dispatch(setDirection(dy < 0 ? "up" : "down"));

    const nx = Math.max(0, Math.min(WORLD_W - TILE, pos.x + dx * SPEED * delta));
    const ny = Math.max(0, Math.min(WORLD_H - TILE, pos.y + dy * SPEED * delta));
    if (nx !== pos.x || ny !== pos.y) dispatch(setPosition({ x: nx, y: ny, world: { w: WORLD_W, h: WORLD_H, tile: TILE } }));
  }, [delta, left, right, up, down, pos.x, pos.y, dispatch]);

  // “Go Potty” action
  useKeyboardShortcuts(
    {
      p: () => handleGo(),
      enter: () => handleGo(),
    },
    { enabled: true, preventDefault: true }
  );

  const inYard = pos.x >= YARD_X_START; // simple zone check
  const ready = bladder >= 60;

  function handleGo() {
    if (!ready) return; // not full enough

    if (inYard) {
      // success
      dispatch(changeBladder(-bladder)); // empty completely
      dispatch(pottyProgress({ delta: 15 })); // progress per success
      dispatch(changeHappiness(+6));
      dispatch(addXP(5));
      dispatch(setMilestone({ key: "firstPotty", value: true }));
    } else {
      // accident indoors
      dispatch(pottyAccident());
    }
  }

  const bladderBar = useMemo(() => {
    if (bladder > 80) return "bg-red-500";
    if (bladder > 60) return "bg-orange-500";
    if (bladder > 30) return "bg-yellow-500";
    return "bg-emerald-500";
  }, [bladder]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-gradient-to-br from-amber-50 to-emerald-100">
      {/* Header */}
      <div className="w-full max-w-4xl px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-emerald-900">Potty Trainer</h2>
        <Link
          to="/game"
          className="px-3 py-2 rounded-xl bg-white shadow hover:shadow-md active:scale-95"
          title="Back to Game"
        >
          ← Back to Game
        </Link>
      </div>

      {/* HUD */}
      <div className="w-full max-w-4xl px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-emerald-900 font-medium">Bladder</span>
          <div className="w-56 h-3 bg-emerald-900/10 rounded">
            <div className={`h-3 ${bladderBar} rounded`} style={{ width: `${bladder}%` }} />
          </div>
          <span className="text-emerald-900/70 text-sm">{Math.round(bladder)}%</span>
        </div>

        <button
          onClick={handleGo}
          className={`px-3 py-2 rounded-xl shadow ${ready ? "bg-emerald-600 text-white hover:shadow-md active:scale-95" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
          title="P or Enter"
        >
          🚽 Go Potty (P)
        </button>
      </div>

      {/* World */}
      <div className="w-full max-w-4xl px-4 mt-3">
        <div className="relative rounded-2xl overflow-hidden shadow-inner" style={{ width: WORLD_W, height: WORLD_H }}>
          {/* Indoors (left 7 tiles) */}
          <div className="absolute inset-0" style={{ width: YARD_X_START, height: WORLD_H,
            backgroundImage:
              "linear-gradient(0deg,#ede9fe 0 1px,transparent 1px), linear-gradient(90deg,#ede9fe 0 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            backgroundColor: "#faf5ff"
          }} />

          {/* Yard (right 3 tiles) */}
          <div className="absolute right-0 top-0" style={{ left: YARD_X_START, height: WORLD_H,
            backgroundImage:
              "linear-gradient(0deg,#c7f9cc 0 1px,transparent 1px), linear-gradient(90deg,#c7f9cc 0 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            backgroundColor: "#bbf7d0"
          }} />

          {/* Divider label */}
          <div className="absolute top-2 left-2 text-xs px-2 py-1 rounded bg-white/80 text-emerald-900">Indoors</div>
          <div className="absolute top-2 right-2 text-xs px-2 py-1 rounded bg-white/80 text-emerald-900">Yard (go here!)</div>

          {/* Dog */}
          <div className="absolute transition-transform will-change-transform" style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}>
            <DogSprite size={64} frameWidth={64} frameHeight={64} direction={dir} isWalking={true} frameCount={4} frameRate={10} />
          </div>
        </div>

        <p className="mt-3 text-sm text-emerald-900/70">
          Move with Arrow Keys / WASD. When the bladder is high (&ge; 60%), press <span className="font-mono">P</span> (or Enter).
          Do it in the <b>yard</b> for progress — indoors causes an accident.
        </p>
      </div>
    </div>
  );
}
