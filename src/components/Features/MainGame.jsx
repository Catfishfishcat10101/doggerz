// src/components/UI/MainGame.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { move, startWalking, stopWalking } from "../../redux/dogSlice";
import useKeyPressed from "../UI/hooks/useKeyPressed";
import Dog from "./Dog"; // <- show the dog

const SPRITE_SIZE = 64;

export default function MainGame() {
  const dog = useSelector((state) => state.dog);
  const dispatch = useDispatch();

  const isSprinting = useKeyPressed("Shift");

  // --- Measure arena size for clamping ---
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

  // --- Clamp helper (DogSprite is centered on x,y) ---
  const clampToArena = useCallback(
    (x, y) => {
      const half = SPRITE_SIZE / 2;
      const maxX = Math.max(half, arenaSize.w - half);
      const maxY = Math.max(half, arenaSize.h - half);
      return {
        x: Math.max(half, Math.min(x, maxX)),
        y: Math.max(half, Math.min(y, maxY)),
      };
    },
    [arenaSize.w, arenaSize.h]
  );

  // --- Prevent overlapping timeouts between key presses ---
  const lastMoveTimeout = useRef(null);

  const walkDog = useCallback(
    (dx = 0, dy = 0) => {
      if (dx === 0 && dy === 0) return;

      const step = isSprinting ? 28 : 16;     // distance per tap
      const duration = isSprinting ? 250 : 400; // anim time per step (ms)

      const targetX = dog.x + dx * step;
      const targetY = dog.y + dy * step;
      const { x, y } = clampToArena(targetX, targetY);

      const direction =
        dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up";

      // clear previous scheduled stop, if any
      if (lastMoveTimeout.current) {
        clearTimeout(lastMoveTimeout.current);
        lastMoveTimeout.current = null;
      }

      dispatch(startWalking());
      lastMoveTimeout.current = setTimeout(() => {
        dispatch(move({ x, y, direction }));
        dispatch(stopWalking());
        lastMoveTimeout.current = null;
      }, duration);
    },
    [dispatch, dog.x, dog.y, clampToArena, isSprinting]
  );

  // --- WASD + Arrow keys ---
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;

      if (["ArrowUp", "w", "W"].includes(e.key)) { e.preventDefault(); walkDog(0, -1); }
      else if (["ArrowDown", "s", "S"].includes(e.key)) { e.preventDefault(); walkDog(0, 1); }
      else if (["ArrowLeft", "a", "A"].includes(e.key)) { e.preventDefault(); walkDog(-1, 0); }
      else if (["ArrowRight", "d", "D"].includes(e.key)) { e.preventDefault(); walkDog(1, 0); }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [walkDog]);

  // --- Cleanup any outstanding timeout when unmounting ---
  useEffect(() => {
    return () => {
      if (lastMoveTimeout.current) {
        clearTimeout(lastMoveTimeout.current);
      }
    };
  }, []);

  return (
    <div
      ref={arenaRef}
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Dog positioned by x/y, anchored to center */}
      <DogSprite
        x={dog.x}
        y={dog.y}
        direction={dog.direction}
        walking={dog.walking}
        size={SPRITE_SIZE}
      />
    </div>
  );
}
