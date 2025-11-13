import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  triggerIdleScratch,
  triggerIdleBark,
  startWalkLeft,
  startWalkRight,
  triggerAttention,
  setAnimation,
  move,
  selectDog,
} from "@/redux/dogSlice.js";

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dog = useSelector(selectDog);

  useEffect(() => {
    const loop = setInterval(() => {
      if (dog.isAsleep) return;

      // Random idle events
      if (Math.random() < 0.01) dispatch(triggerIdleScratch());
      else if (Math.random() < 0.01) dispatch(triggerIdleBark());

      // Walk left or right randomly
      if (Math.random() < 0.005) {
        dispatch(startWalkLeft());
        dispatch(move({ x: dog.pos.x - 8 }));
      }
      if (Math.random() < 0.005) {
        dispatch(startWalkRight());
        dispatch(move({ x: dog.pos.x + 8 }));
      }

      // Attention-seeking behavior
      if (Math.random() < 0.003) {
        dispatch(triggerAttention());
      }

      // Return to idle after special actions
      if (
        ["idle_scratch", "idle_bark", "attention"].includes(dog.animation)
      ) {
        if (Math.random() < 0.1) {
          dispatch(setAnimation("idle"));
        }
      }
    }, 400);

    return () => clearInterval(loop);
  }, [dog]);

  return null;
}
