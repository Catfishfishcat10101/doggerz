// src/hooks/useGameTick.js
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { tick, levelCheck, selectDog } from "@/redux/dogSlice";
import { saveSnapshot } from "@/lib/persistence";
import { rewardPassive } from "@/redux/economySlice";

export default function useGameTick() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  useEffect(() => {
    const t = setInterval(() => {
      dispatch(tick());
      dispatch(levelCheck());
      // tiny passive coin drip when mood is healthy
      if (dog.mood === "happy" || dog.mood === "ecstatic") {
        dispatch(rewardPassive(1));
      }
    }, 1000);

    const p = setInterval(() => {
      saveSnapshot(dog).catch(() => {});
    }, 10_000);

    return () => { clearInterval(t); clearInterval(p); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, dog.id]);
}