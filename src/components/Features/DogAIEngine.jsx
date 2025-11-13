// src/components/Features/DogAIEngine.jsx
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { move, selectDog } from "@/redux/dogSlice.js";

// Match DogSpriteView defaults
const WORLD_W = 480;
const WORLD_H = 320;
const SPRITE_SIZE = 160; // same as renderSize in DogSpriteView
const STEP = 12;         // how far each wander step is

export default function DogAIEngine({
  worldW = WORLD_W,
  worldH = WORLD_H,
  spriteSize = SPRITE_SIZE,
}) {
  const dispatch = useDispatch();

  const dog = useSelector(selectDog) || {};
  const pos = dog.pos || {
    x: (worldW - spriteSize) / 2,
    y: (worldH - spriteSize) / 2,
  };

  // Ensure we have an initial position set in Redux
  useEffect(() => {
    if (!dog.pos) {
      dispatch(
        move({
          x: pos.x,
          y: pos.y,
        })
      );
    }
  }, [dog.pos, dispatch, pos.x, pos.y]);

  useEffect(() => {
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;

      // small random step – sometimes bigger, sometimes smaller
      const angle = Math.random() * Math.PI * 2;
      const distance = STEP * (0.5 + Math.random()); // between 0.5x and 1.5x step
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      let nx = pos.x + dx;
      let ny = pos.y + dy;

      // Clamp to "playfield" bounds
      nx = Math.max(0, Math.min(worldW - spriteSize, nx));
      ny = Math.max(0, Math.min(worldH - spriteSize, ny));

      dispatch(move({ x: nx, y: ny }));

      // schedule next idle wander in 300–800ms
      const delay = 300 + Math.random() * 500;
      if (!cancelled) {
        setTimeout(tick, delay);
      }
    };

    // initial kick
    const delay = 300 + Math.random() * 500;
    const id = setTimeout(tick, delay);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [dispatch, pos.x, pos.y, worldW, worldH, spriteSize]);

  return null;
}
