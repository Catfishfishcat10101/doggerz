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
  addXP,
  changeHappiness,
  selectDirection,
  selectHappiness,
  selectMoving,
  selectPos,
  setDirection,
  setHappiness,
  setMoving,
  setPosition,
  tickNeeds,
  selectBackyardSkin,
} from "../../redux/dogSlice";

/**
 * GameScreen — slot-enabled world container
 *
 * Slots (all optional):
 * - renderHUDLeft(ctx): node
 * - renderHUDRight(ctx): node
 * - renderBelowWorld(ctx): node
 * - renderOverlay(ctx): node
 * - renderWorldBackground(ctx): node   // NEW: background layer under the actor
 *
 * Callbacks (optional, fired in addition to built-ins):
 * - onBark(ctx)
 * - onSpeedChange(speed, ctx)            // 1 or 2
 * - onMove({dx,dy,isMoving}, ctx)        // per frame when keys pressed
 * - onTickNeeds(dtSec, ctx)              // internal needs tick
 *
 * ctx object passed to slots/callbacks:
 * {
 *   pos, dir, moving, happiness, backyardSkin,
 *   setSpeed, bark, holdPetBind, dispatch,
 *   WORLD, TILE, SPEED
 * }
 */

const WORLD = { w: 640, h: 360 };
const TILE = 64;
const SPEED = 140;

export default function GameScreen({
  // slots
  renderHUDLeft,
  renderHUDRight,
  renderBelowWorld,
  renderOverlay,
  renderWorldBackground, // NEW
  // callbacks
  onBark,
  onSpeedChange,
  onMove,
  onTickNeeds,
}) {
  const dispatch = useDispatch();

  const pos = useSelector(selectPos);
  const dir = useSelector(selectDirection);
  const moving = useSelector(selectMoving);
  const happiness = useSelector(selectHappiness);
  const backyardSkin = useSelector(selectBackyardSkin);

  const audioRef = useRef(null);

  const ctx = () => ({
    pos,
    dir,
    moving,
    happiness,
    backyardSkin,
    setSpeed,
    bark,
    holdPetBind,
    dispatch,
    WORLD,
    TILE,
    SPEED,
  });

  const bark = useCallback(async () => {
    try {
      await audioRef.current?.play();
    } catch {}
    onBark?.(ctx());
    // ergonomics: small happy tick on bark makes UX feel alive
    // (safe no-op if you remove it)
  }, [onBark]); // eslint-disable-line react-hooks/exhaustive-deps

  const { delta, setSpeed } = useGameClock({
    running: true,
    speed: 1,
    pauseOnHidden: true,
  });

  const left = useKeyPressed(["arrowleft", "a"]);
  const right = useKeyPressed(["arrowright", "d"]);
  const up = useKeyPressed(["arrowup", "w"]);
  const down = useKeyPressed(["arrowdown", "s"]);

  const { bind: holdPetBind } = useHoldRepeat(
    () => {
      dispatch(changeHappiness(+1));
      dispatch(addXP(1));
    },
    { initialDelay: 200, interval: 80 }
  );

  useKeyboardShortcuts(
    {
      b: () => bark(),
      "shift+.": () => {
        setSpeed(2);
        onSpeedChange?.(2, ctx());
      },
      ".": () => {
        setSpeed(1);
        onSpeedChange?.(1, ctx());
      },
    },
    { enabled: true, preventDefault: true }
  );

  useJitteredTimer({ baseMs: 3000, jitter: 0.25, autoStart: true });

  // Needs tick + occasional bark
  useEffect(() => {
    const id = setInterval(() => {
      if (document.hidden) return;
      const dtSec = 3;
      dispatch(tickNeeds({ dtSec }));
      onTickNeeds?.(dtSec, ctx());
      if (Math.random() < 0.08) bark();
    }, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, bark]);

  usePageVisibility({ onHide: () => audioRef.current?.pause() });

  // Movement loop (key state → direction/position)
  useEffect(() => {
    let dx = 0,
      dy = 0;
    if (left) dx -= 1;
    if (right) dx += 1;
    if (up) dy -= 1;
    if (down) dy += 1;

    const isMoving = dx !== 0 || dy !== 0;
    if (isMoving !== moving) dispatch(setMoving(isMoving));
    if (!isMoving) return;

    // normalize diagonals
    if (dx && dy) {
      const inv = 1 / Math.sqrt(2);
      dx *= inv;
      dy *= inv;
    }
    if (Math.abs(dx) > Math.abs(dy)) {
      dispatch(setDirection(dx < 0 ? "left" : "right"));
    } else if (Math.abs(dy) > 0) {
      dispatch(setDirection(dy < 0 ? "up" : "down"));
    }

    const nx = clamp(pos.x + dx * SPEED * delta, 0, WORLD.w - TILE);
    const ny = clamp(pos.y + dy * SPEED * delta, 0, WORLD.h - TILE);

    if (nx !== pos.x || ny !== pos.y) {
      dispatch(setPosition({ x: nx, y: ny, world: { w: WORLD.w, h: WORLD.h, tile: TILE } }));
    }

    onMove?.({ dx, dy, isMoving }, ctx());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [delta, left, right, up, down, pos.x, pos.y, moving, dispatch]);

  // HUD colors + world style
  const barColor = useMemo(
    () => (happiness > 66 ? "bg-green-500" : happiness > 33 ? "bg-yellow-500" : "bg-red-500"),
    [happiness]
  );

  const worldStyle = useMemo(() => {
    // If a custom background is injected, keep container transparent
    const base = { width: WORLD.w, height: WORLD.h };
    if (renderWorldBackground) return base;

    if (backyardSkin === "lush") {
      return {
        ...base,
        backgroundColor: "#b7f7c5",
        backgroundImage:
          "linear-gradient(0deg,#99f0ae 0 1px,transparent 1px), linear-gradient(90deg,#99f0ae 0 1px, transparent 1px)",
        backgroundSize: "64px 64px",
        border: "2px solid rgba(16,185,129,0.25)",
      };
    }
    return { ...base, backgroundColor: "rgba(6,95,70,0.05)" };
  }, [backyardSkin, renderWorldBackground]);

  const happinessWidthStyle = { width: `${clamp(happiness, 0, 100)}%` };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-emerald-50 to-emerald-200 flex flex-col items-center">
      <FirebaseAutoSave />
      <audio ref={audioRef} src={barkSfx} preload="auto" />

      {/* HUD */}
      <div className="w-full max-w-4xl px-4 py-3 flex items-center justify-between">
        {/* LEFT HUD SLOT */}
        <div className="flex items-center gap-3">
          {renderHUDLeft ? (
            renderHUDLeft(ctx())
          ) : (
            <>
              <span className="font-semibold text-emerald-900">Happiness</span>
              <div className="w-48 h-3 bg-emerald-900/10 rounded">
                <div className={`h-3 ${barColor} rounded`} style={happinessWidthStyle} />
              </div>
            </>
          )}
        </div>

        {/* RIGHT HUD SLOT */}
        <div className="flex flex-wrap items-center gap-2">
          {renderHUDRight ? (
            renderHUDRight(ctx())
          ) : (
            <>
              <Link
                to="/shop"
                className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
              >
                🛒 Shop
              </Link>
              <Link
                to="/train/potty"
                className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
              >
                🚽 Potty
              </Link>
              <Link
                to="/train/tricks"
                className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
              >
                🎓 Tricks
              </Link>
              <Link
                to="/breed"
                className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
              >
                🐶 Breed
              </Link>
              <Link
                to="/accessories"
                className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
              >
                🧢 Accessories
              </Link>
              <Link
                to="/stats"
                className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
              >
                📊 Stats
              </Link>

              <button
                {...holdPetBind}
                className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
                title="Hold to pet"
              >
                🐶 Pet
              </button>

              <button
                onClick={() => {
                  bark();
                  dispatch(setHappiness(Math.min(100, happiness + 2)));
                  dispatch(addXP(2));
                }}
                className="px-3 py-2 text-sm rounded-xl bg-white shadow hover:shadow-md active:scale-95"
                title="Bark (B)"
              >
                🗣️ Bark
              </button>
            </>
          )}
        </div>
      </div>

      {/* WORLD */}
      <div className="w-full max-w-4xl px-4">
        <div className="relative rounded-2xl shadow-inner overflow-hidden" style={worldStyle}>
          {/* Background slot under the actor */}
          {renderWorldBackground && (
            <div className="absolute inset-0 z-0 pointer-events-none">
              {renderWorldBackground(ctx())}
            </div>
          )}

          {/* Actor layer */}
          <div
            className="absolute z-10 transition-transform will-change-transform"
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

          {/* Overlay slot above everything */}
          {renderOverlay && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              {renderOverlay(ctx())}
            </div>
          )}
        </div>

        {/* Below-world slot */}
        {renderBelowWorld ? (
          renderBelowWorld(ctx())
        ) : (
          <p className="mt-3 text-sm text-emerald-900/70">
            Move with Arrow Keys / WASD • Hold <span className="font-mono">.</span> +{" "}
            <span className="font-mono">Shift</span> to speed time • Press{" "}
            <span className="font-mono">B</span> to bark
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------- utils ---------------- */
function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
