// src/components/Features/Dog.jsx
/* Div-based sprite that walks with CSS transitions */
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dropPoop, playBark, move } from "../../store/dogSlice";
import jackRussellSprite from "../../assets/sprites/jack_russell_directions.png";

const W = 256;
const H = 256;
const FRAMES = 4;
const dirs = ["right", "left", "down", "up"];
const rowFor = d => ({ right:0, left:1, down:2, up:3 }[d]);

const Dog = () => {
  const dispatch = useDispatch();
  const { x, y, direction, isWalking } = useSelector(s => s.dog);
  const [frame, setFrame] = useState(0);
  const stepRef = useRef(0);

  /* walk ticker */
  useEffect(() => {
    if (!isWalking) return;
    const fId = setInterval(() => setFrame(f => (f + 1) % FRAMES), 150);
    return () => clearInterval(fId);
  }, [isWalking]);

  /* move ticker */
  useEffect(() => {
    if (!isWalking) return;
    const tick = setInterval(() => {
      stepRef.current += 1;
      /* random direction every 2 s */
      const dir = stepRef.current % 13 === 0 ? dirs[Math.floor(Math.random()*4)] : direction;
      const step = 20;
      const nx = Math.max(0, Math.min(window.innerWidth  - W, x + (dir==="right"?step:dir==="left"?-step:0)));
      const ny = Math.max(0, Math.min(window.innerHeight - H, y + (dir==="down"?step:dir==="up"?-step:0)));
      dispatch(move({ x: nx, y: ny, direction: dir }));

      /* drop poop every 80 steps */
      if (stepRef.current % 80 === 0) dispatch(dropPoop({ x: nx, y: ny }));
      /* bark sometimes */
      if (stepRef.current % 40 === 0 && Math.random() < 0.25) dispatch(playBark());
    }, 300);
    return () => clearInterval(tick);
  }, [isWalking, x, y, direction, dispatch]);

  const style = {
    width: W, height: H,
    backgroundImage: `url(${jackRussellSprite})`,
    backgroundPosition: `-${frame*W}px -${rowFor(direction)*H}px`,
    backgroundSize: `${W*FRAMES}px ${H*dirs.length}px`,
    position:"absolute", top:y, left:x,
    imageRendering:"pixelated",
    transition:"top .3s linear,left .3s linear",
    pointerEvents:"none",
  };
  return <div style={style} />;
};

export default Dog;