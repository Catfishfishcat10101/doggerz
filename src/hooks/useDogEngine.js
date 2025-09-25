import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import useGameClock from "./useGameClock";
import { tickNeeds, setPosition, setDirection, setMoving } from "@/redux/dogSlice";

export default function useDogEngine({
  movementSpeed = 80,
  needsTickHz = 4,
  running: runningProp = true,
} = {}) {
  const dispatch = useDispatch();
  const { delta } = useGameClock({ running: runningProp, speed: 1, pauseOnHidden: true });
  const [running, setRunning] = useState(Boolean(runningProp));
  useEffect(() => setRunning(Boolean(runningProp)), [runningProp]);

  const keysRef = useRef({ up: false, down: false, left: false, right: false });
  const posRef = useRef({ x: 0, y: 0 });
  const dirRef = useRef("down");
  const movedRef = useRef(false);
  const needsAccRef = useRef(0);
  const needsInterval = 1 / Math.max(1, needsTickHz);

  useEffect(() => {
    const onDown = (e) => {
      switch (e.key) {
        case "ArrowUp": case "w": case "W": keysRef.current.up = true; dirRef.current = "up"; break;
        case "ArrowDown": case "s": case "S": keysRef.current.down = true; dirRef.current = "down"; break;
        case "ArrowLeft": case "a": case "A": keysRef.current.left = true; dirRef.current = "left"; break;
        case "ArrowRight": case "d": case "D": keysRef.current.right = true; dirRef.current = "right"; break;
        default: return;
      }
      e.preventDefault();
      dispatch(setMoving(true));
      dispatch(setDirection(dirRef.current));
    };
    const onUp = (e) => {
      switch (e.key) {
        case "ArrowUp": case "w": case "W": keysRef.current.up = false; break;
        case "ArrowDown": case "s": case "S": keysRef.current.down = false; break;
        case "ArrowLeft": case "a": case "A": keysRef.current.left = false; break;
        case "ArrowRight": case "d": case "D": keysRef.current.right = false; break;
        default: return;
      }
      e.preventDefault();
      const k = keysRef.current;
      const isMoving = k.up || k.down || k.left || k.right;
      dispatch(setMoving(isMoving));
      if (isMoving) dispatch(setDirection(dirRef.current));
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [dispatch]);

  useEffect(() => {
    if (!running) return;
    const dt = delta;
    if (dt <= 0) return;

    const k = keysRef.current;
    let vx = 0, vy = 0;
    if (k.up) vy -= 1;
    if (k.down) vy += 1;
    if (k.left) vx -= 1;
    if (k.right) vx += 1;

    if (vx !== 0 || vy !== 0) {
      const len = Math.hypot(vx, vy) || 1;
      vx /= len; vy /= len;
      posRef.current.x += vx * movementSpeed * dt;
      posRef.current.y += vy * movementSpeed * dt;
      const nx = Math.round(posRef.current.x);
      const ny = Math.round(posRef.current.y);
      dispatch(setPosition({ x: nx, y: ny }));
      movedRef.current = true;
    } else if (movedRef.current) {
      dispatch(setMoving(false));
      movedRef.current = false;
    }

    needsAccRef.current += dt;
    if (needsAccRef.current >= needsInterval) {
      const batchDt = needsAccRef.current; needsAccRef.current = 0;
      dispatch(tickNeeds({ dt: batchDt }));
    }
  }, [delta, running, movementSpeed, needsTickHz, dispatch]);

  return { running, start: () => setRunning(true), stop: () => setRunning(false) };
}
