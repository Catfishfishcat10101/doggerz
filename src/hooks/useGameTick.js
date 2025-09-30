import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { tick, levelCheck } from "@/redux/dogSlice";

export default function useGameTick(enabled = true) {
  const dispatch = useDispatch();
  const raf = useRef(0);

  useEffect(() => {
    if (!enabled) return;
    let running = true;
    const loop = (t) => {
      if (!running) return;
      dispatch(tick({ now: t }));
      dispatch(levelCheck());
      raf.current = requestAnimationFrame(loop);
    };
    raf.current = requestAnimationFrame(loop);

    const onHide = () => running = !document.hidden;
    document.addEventListener("visibilitychange", onHide);
    return () => {
      cancelAnimationFrame(raf.current);
      document.removeEventListener("visibilitychange", onHide);
    };
  }, [enabled, dispatch]);
}
