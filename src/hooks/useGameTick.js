/* src/hooks/useGameTick.js*/
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { gameTick, gamePaused } from "@/redux/gameSlice";

/**
 * Drives the sim using RAF; adapts when tab hidden and caps catch-up.
 */
export function useGameTick() {
  const dispatch = useDispatch();
  const raf = useRef(0);
  const last = useRef(performance.now());

useEffect(() => {
  function loop(ts) {
    const dtMs = ts - last.current;
    last.current = ts;
    dispatch(gameTick({ dtMs }));
    raf.current = requestAnimationFrame(loop);
  }

  function onVisible() {
    last.current = performance.now();
    dispatch(gamePaused(false));
  }

  function onHidden() {
    dispatch(gamePaused(true));
  }

  function handleVisibilityChange() {
    document.hidden ? onHidden() : onVisible();
  }

  raf.current = requestAnimationFrame(loop);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    cancelAnimationFrame(raf.current);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [dispatch]);
}
