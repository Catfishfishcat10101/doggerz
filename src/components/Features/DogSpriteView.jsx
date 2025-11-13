// src/components/Features/DogSpriteView.jsx
import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

export default function DogSpriteView({
  src = "/sprites/jrt_4x4.png",
  columns = 4,
  rows = 4,
  fps = 8,
  renderSize = 160,
  worldW = 480,
  worldH = 320,
  rowDown = 0,
  rowLeft = 1,
  rowRight = 2,
  rowUp = 3,
}) {
  // ----- SAFE STATE -----
  const dogState = useSelector(selectDog) || {};

  // Fallback to centered position if dog.pos is missing
  const pos = dogState.pos ?? {
    x: (worldW - renderSize) / 2,
    y: (worldH - renderSize) / 2,
  };

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  const frameRef = useRef(0);
  const accumRef = useRef(0);
  const lastTsRef = useRef(0);

  const lastPosRef = useRef(pos);
  const dirRef = useRef("down");

  // keep lastPos in sync when pos changes abruptly (e.g. teleport, load)
  useEffect(() => {
    lastPosRef.current = pos;
  }, [pos.x, pos.y]);

  // ----- LOAD SPRITESHEET -----
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imgRef.current = img;
    };
    return () => {
      imgRef.current = null;
    };
  }, [src]);

  // ----- ANIMATION LOOP -----
  useEffect(() => {
    let raf = 0;

    const loop = (ts) => {
      const c = canvasRef.current;
      const img = imgRef.current;

      if (!c || !img) {
        raf = requestAnimationFrame(loop);
        return;
      }

      const ctx = c.getContext("2d", { alpha: true });
      const lastTs = lastTsRef.current || ts;
      const dt = Math.min(0.05, (ts - lastTs) / 1000);
      lastTsRef.current = ts;

      const lastPos = lastPosRef.current;
      const dx = pos.x - lastPos.x;
      const dy = pos.y - lastPos.y;
      const speed = Math.hypot(dx, dy);

      // choose facing direction based on movement
      if (speed > 0.2) {
        const ax = Math.abs(dx);
        const ay = Math.abs(dy);
        if (ax > ay) {
          dirRef.current = dx < 0 ? "left" : "right";
        } else {
          dirRef.current = dy < 0 ? "up" : "down";
        }
      }

      const fw = img.width / columns;
      const fh = img.height / rows;

      // animate only while moving
      if (speed > 0.2) {
        accumRef.current += dt;
        const step = 1 / fps;
        while (accumRef.current >= step) {
          frameRef.current = (frameRef.current + 1) % columns;
          accumRef.current -= step;
        }
      } else {
        frameRef.current = 0;
        accumRef.current = 0;
      }

      let row = rowDown;
      const dir = dirRef.current;
      if (dir === "left") row = rowLeft;
      else if (dir === "right") row = rowRight;
      else if (dir === "up") row = rowUp;

      ctx.clearRect(0, 0, c.width, c.height);
      ctx.imageSmoothingEnabled = true;

      const sx = Math.floor(frameRef.current * fw);
      const sy = Math.floor(row * fh);

      // draw with pos as top-left of sprite
      const px = Math.round(pos.x);
      const py = Math.round(pos.y);

      ctx.drawImage(img, sx, sy, fw, fh, px, py, renderSize, renderSize);

      lastPosRef.current = { ...pos };
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [
    pos.x,
    pos.y,
    columns,
    rows,
    fps,
    renderSize,
    rowDown,
    rowLeft,
    rowRight,
    rowUp,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={worldW}
      height={worldH}
      className="mx-auto block rounded-lg bg-zinc-900/60 shadow-inner"
      style={{ imageRendering: "auto" }}
    />
  );
}
