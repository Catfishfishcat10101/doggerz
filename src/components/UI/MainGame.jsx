// src/components/UI/MainGame.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import DogSprite from "./DogSprite";
import Controls from "./Controls";
import TrickList from "./TrickList";
import {
  gainXP,
  feedDog,
  playWithDog,
  batheDog,
  move,
  startWalking,
  stopWalking,
} from "../../redux/dogSlice";
import { useNavigate } from "react-router-dom";
import useKeyPressed from "./hooks/useKeyPressed";

// If your DogSprite uses 64px frames and centerAnchor, keep this:
const SPRITE_SIZE = 64;

function StatBar({ label, value, colorClass = "from-sky-400 to-sky-600" }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="font-semibold text-white/90 text-sm">{label}</span>
      <div className="flex-1 h-2.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClass} transition-[width] duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-white/70 text-xs w-9 text-right tabular-nums">{pct}%</span>
    </div>
  );
}

export default function MainGame() {
  const dog = useSelector((state) => state.dog);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Detect sprint (hold Shift)
  const isSprinting = useKeyPressed("Shift");

  // Arena measurement to clamp position
  const arenaRef = useRef(null);
  const [arenaSize, setArenaSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    if (!arenaRef.current) return;
    const el = arenaRef.current;
    const ro = new ResizeObserver(() => {
      const rect = el.getBoundingClientRect();
      setArenaSize({ w: Math.floor(rect.width), h: Math.floor(rect.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Background theme by local time
  const timeTheme = useMemo(() => {
    const h = new Date().getHours();
    if (h >= 6 && h < 17) return "day";
    if (h >= 17 && h < 21) return "evening";
    return "night";
  }, []);

  const bgUrl =
    timeTheme === "day"
      ? "/backgrounds/yard_day.png"
      : timeTheme === "evening"
      ? "/backgrounds/yard_evening.png"
      : "/backgrounds/yard_night.png";

  // Clamp helper (DogSprite is centered on x,y)
  const clampToArena = useCallback(
    (x, y) => {
      const half = SPRITE_SIZE / 2;
      const maxX = Math.max(half, arenaSize.w - half);
      const maxY = Math.max(half, arenaSize.h - half);
      const clampedX = Math.max(half, Math.min(x, maxX));
      const clampedY = Math.max(half, Math.min(y, maxY));
      return { x: clampedX, y: clampedY };
    },
    [arenaSize.w, arenaSize.h]
  );

  // Movement handler
  const walkDog = useCallback(
    (dx = 0, dy = 0) => {
      // Step and animation duration scale with sprint
      const step = isSprinting ? 28 : 16; // tweak to taste
      const duration = isSprinting ? 250 : 400;

      const targetX = dog.x + dx * step;
      const targetY = dog.y + dy * step;
      const { x, y } = clampToArena(targetX, targetY);

      const direction =
        dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up";

      dispatch(startWalking());
      // Move after a short delay to let the walk animation be noticeable
      const t = setTimeout(() => {
        dispatch(move({ x, y, direction }));
        dispatch(stopWalking());
      }, duration);

      // Cleanup if component unmounts mid-move
      return () => clearTimeout(t);
    },
    [dispatch, dog.x, dog.y, clampToArena, isSprinting]
  );

  // Optional: WASD/Arrows direct movement sync (in addition to Controls hotkeys)
  // If you already wired hotkeys in Controls, you can remove this.
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;

      if (["ArrowUp", "w", "W"].includes(e.key)) { e.preventDefault(); walkDog(0, -1); }
      else if (["ArrowDown", "s", "S"].includes(e.key