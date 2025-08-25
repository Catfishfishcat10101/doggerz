// src/components/Features/Dog.jsx
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dropPoop, playBark, move } from "../../redux/dogSlice.js";
// sprite lives in the sibling UI/sprites folder
import jackRussellSprite from "../UI/sprites/jack_russell_directions.png";

const W = 256; // sprite width
const H = 256; // sprite height
const FRAMES = 4; // frames per row
const dirs = ["right", "left", "down", "up"];
const rowFor = (d) => ({ right: 0, left: 1, down: 2, up: 3 })[d];

const Dog = () => {
  const dispatch = useDispatch();
  // Redux slice uses `walking` elsewhere (MainGame passes dog.walking)
  const { x, y, direction, walking } = useSelector((s) => s.dog);

  const [frame, setFrame] = useState(0);
  const stepRef = useRef(0);

  /* ── frame ticker (sprite sheet) ───────────────────────────── */
  useEffect(() => {
    if (!walking) return;

    const fId = setInterval(() => {
      setFrame((f) => (f + 1) % FRAMES);
    }, 150); // 150 ms per animation frame

    return () => clearInterval(fId);
  }, [walking]);

  /* ── movement ticker + bark / poop ─────────────────────────── */
  useEffect(() => {
    if (!walking) return;

    const tick = setInterval(() => {
      stepRef.current += 1;

      // change heading every ~2 s
      const dir =
        stepRef.current % 13 === 0
          ? dirs[Math.floor(Math.random() * dirs.length)]
          : direction;

      const step = 20;
      const nx = Math.max(
        0,
        Math.min(
          window.innerWidth - W,
          x + (dir === "right" ? step : dir === "left" ? -step : 0),
        ),
      );
      const ny = Math.max(
        0,
        Math.min(
          window.innerHeight - H,
          y + (dir === "down" ? step : dir === "up" ? -step : 0),
        ),
      );

      dispatch(move({ x: nx, y: ny, direction: dir }));

      // drop poop every 80 steps
      if (stepRef.current % 80 === 0) dispatch(dropPoop({ x: nx, y: ny }));

      // bark occasionally
      if (stepRef.current % 40 === 0 && Math.random() < 0.25)
        dispatch(playBark());
  }, 300); // movement step every 300 ms

    return () => clearInterval(tick);
  }, [walking, x, y, direction, dispatch]);

  /* ── inline sprite styling ─────────────────────────────────── */
  const style = {
    width: W,
    height: H,
    backgroundImage: `url(${jackRussellSprite})`,
    backgroundPosition: `-${frame * W}px -${rowFor(direction) * H}px`,
    backgroundSize: `${W * FRAMES}px ${H * dirs.length}px`,
    position: "absolute",
    top: y,
    left: x,
    imageRendering: "pixelated",
    transition: "top 0.3s linear, left 0.3s linear",
    pointerEvents: "none",
  };

  return <div style={style} />;
};

export default Dog;
