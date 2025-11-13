import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { move, selectDog } from "@/redux/dogSlice.js";

const WORLD_W = 480;
const WORLD_H = 320;
const SPRITE_SIZE = 160;
const STEP = 12;

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

  useEffect(() => {
    if (!dog.pos) {
      dispatch(move({ x: pos.x, y: pos.y }));
    }
  }, [dog.pos, dispatch, pos.x, pos.y]);

  useEffect(() => {
    let cancelled = false;

    const tick = () => {
      if (cancelled) return;

      const angle = Math.random() * Math.PI * 2;
      const distance = STEP * (0.5 + Math.random());
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      let nx = pos.x + dx;
      let ny = pos.y + dy;

      nx = Math.max(0, Math.min(worldW - spriteSize, nx));
      ny = Math.max(0, Math.min(worldH - spriteSize, ny));

      dispatch(move({ x: nx, y: ny }));

      const delay = 300 + Math.random() * 500;
      if (!cancelled) {
        setTimeout(tick, delay);
      }
    };

    const delay = 300 + Math.random() * 500;
    const id = setTimeout(tick, delay);

    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [dispatch, pos.x, pos.y, worldW, worldH, spriteSize]);

  return null;
}
