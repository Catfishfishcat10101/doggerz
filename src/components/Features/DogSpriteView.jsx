import React, { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { selectDog } from "@/redux/dogSlice.js";

/**
 * View-only canvas for the dog.
 * - Follows Redux position and infers direction from velocity.
 * - Animates when moving; idle frame when still.
 */
export default function DogSpriteView({
  src = "/sprites/jrt_4x4.png",
  columns = 4,
  rows = 4,
  fps = 8,
  renderSize = 160,
  worldW = 480,
  worldH = 320,
  rowDown = 0, rowLeft = 1, rowRight = 2, rowUp = 3,
}) {
  const canvasRef = useRef(null);
  const imgRef = useRef(null);
  const frameRef = useRef(0);
  const accumRef = useRef(0);
  const lastTsRef = useRef(0);
  const lastPos = useRef({ x: 0, y: 0 });
  const dirRef = useRef("down");

  const dog = useSelector(selectDog);

  // load spritesheet
  useEffect(() => {
    const img = new Image();
    img.src = src;
    img.onload = () => { imgRef.current = img; };
    return () => { imgRef.current = null; };
  }, [src]);

  useEffect(() => {
    let raf = 0;
    const loop = (ts) => {
      const canvas = canvasRef.current, img = imgRef.current;
      if (!canvas || !img) { raf = requestAnimationFrame(loop); return; }
      const ctx = canvas.getContext("2d", { alpha: true });
      const dt = Math.min(0.05, (ts - (lastTsRef.current || ts)) / 1000);
      lastTsRef.current = ts;

      // figure direction from velocity
      const dx = dog.pos.x - lastPos.current.x;
      const dy = dog.pos.y - lastPos.current.y;
      const speed = Math.hypot(dx, dy);
      if (speed > 0.2) {
        const ax = Math.abs(dx), ay = Math.abs(dy);
        if (ax > ay) dirRef.current = dx < 0 ? "left" : "right";
        else dirRef.current = dy < 0 ? "up" : "down";
      }

      // frames
      const fw = img.width / columns;
      const fh = img.height / rows;
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

      // row
      let row = rowDown;
      if (dirRef.current === "left") row = rowLeft;
      else if (dirRef.current === "right") row = rowRight;
      else if (dirRef.current === "up") row = rowUp;

      // draw
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const sx = Math.floor(frameRef.current * fw);
      const sy = Math.floor(row * fh);
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, sx, sy, fw, fh, Math.round(dog.pos.x), Math.round(dog.pos.y), renderSize, renderSize);

      lastPos.current = { ...dog.pos };
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [dog.pos.x, dog.pos.y, columns, rows, fps, renderSize, rowDown, rowLeft, rowRight, rowUp]);

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