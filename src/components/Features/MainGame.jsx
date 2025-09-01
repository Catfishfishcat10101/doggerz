// src/components/UI/MainGame.jsx
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { move, startWalking, stopWalking } from "../../redux/dogSlice"; // or "@/redux/dogSlice" if using aliases
import useKeyPressed from "../../hooks/useKeyPressed"; // or "@hooks/useKeyPressed"
import DogSprite from "../../features/DogSprite.jsx";  // or "@features/DogSprite"

const SPRITE_SIZE = 64;

export default function MainGame() {
  const dog = useSelector((s) => s.dog || { x: 96, y: 96, direction: "down", walking: false });
  const dispatch = useDispatch();
  const isSprinting = useKeyPressed("Shift");

  // Measure arena for clamping
  const arenaRef = useRef(null);
  const [arenaSize, setArenaSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    if (!arenaRef.current) return;
    const el = arenaRef.current;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setArenaSize({ w: Math.floor(r.width), h: Math.floor(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Clamp helper (dog.x/y are CENTER coords)
  const clampToArena = useCallback(
    (x, y) => {
      const half = SPRITE_SIZE / 2;
      const maxX = Math.max(half, arenaSize.w - half);
      const maxY = Math.max(half, arenaSize.h - half);
      return { x: Math.max(half, Math.min(x, maxX)), y: Math.max(half, Math.min(y, maxY)) };
    },
    [arenaSize.w, arenaSize.h]
  );

  const lastMoveTimeout = useRef(null);

  const walkDog = useCallback(
    (dx = 0, dy = 0) => {
      if (dx === 0 && dy === 0) return;

      const step = isSprinting ? 28 : 16;
      const duration = isSprinting ? 250 : 400;

      const targetX = dog.x + dx * step;
      const targetY = dog.y + dy * step;
      const { x, y } = clampToArena(targetX, targetY);

      const direction = dx > 0 ? "right" : dx < 0 ? "left" : dy > 0 ? "down" : "up";

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

  // WASD + Arrows
  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target?.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || e.target?.isContentEditable) return;

      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === "ArrowUp" || k === "w") { e.preventDefault(); walkDog(0, -1); }
      else if (k === "ArrowDown" || k === "s") { e.preventDefault(); walkDog(0, 1); }
      else if (k === "ArrowLeft" || k === "a") { e.preventDefault(); walkDog(-1, 0); }
      else if (k === "ArrowRight" || k === "d") { e.preventDefault(); walkDog(1, 0); }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [walkDog]);

  useEffect(() => () => { if (lastMoveTimeout.current) clearTimeout(lastMoveTimeout.current); }, []);

  // Convert center coords -> top-left for sprite component
  const renderX = (dog.x ?? 96) - SPRITE_SIZE / 2;
  const renderY = (dog.y ?? 96) - SPRITE_SIZE / 2;

  return (
    <div
      ref={arenaRef}
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
        background: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
      }}
    >
      <DogSprite
        x={renderX}
        y={renderY}
        direction={dog.direction || "down"}
        isWalking={!!dog.walking}
        size={SPRITE_SIZE}
      />
    </div>
  );
}