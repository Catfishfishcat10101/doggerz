import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { tick as pottyTick } from "../redux/pottySlice";
import { tick as dogTick } from "../redux/dogSlice";

export default function useGameClock(ms = 1000, minutesPerTick = 1) {
  const dispatch = useDispatch();
  const on = useRef(true);

  useEffect(() => {
    on.current = true;
    const id = setInterval(() => {
      if (!on.current) return;
      dispatch(pottyTick(minutesPerTick));
      dispatch(dogTick(minutesPerTick));
    }, ms);
    return () => {
      on.current = false;
      clearInterval(id);
    };
  }, [dispatch, ms, minutesPerTick]);
}
