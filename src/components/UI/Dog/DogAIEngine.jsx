// src/components/DogAIEngine.jsx
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  startWalking,
  stopWalking,
  startBarking,
  stopBarking,
  startPooping,
  stopPooping,
  updateCleanliness,
} from "../../../redux/dogSlice.js";

const WALK_INTERVAL_MS = 8_000; // try random walk every   8 s
const BARK_INTERVAL_MS = 12_000; // try bark        every  12 s
const POOP_INTERVAL_MS = 20_000; // try poop        every  20 s
const CLEANLINESS_INTERVAL_MS = 60_000; // decay hygiene   every  60 s

export default function DogAIEngine() {
  const dispatch = useDispatch();
  const dog = useSelector((s) => s.dog); // keep if you later gate by dog state

  /* 🐾  Random behaviours: walk, bark, poop ----------------------------- */
  useEffect(() => {
    const walkTimer = setInterval(() => {
      if (Math.random() < 0.1) {
        dispatch(startWalking());
        setTimeout(() => dispatch(stopWalking()), 3_000);
      }
    }, WALK_INTERVAL_MS);

    const barkTimer = setInterval(() => {
      if (Math.random() < 0.2) {
        dispatch(startBarking());
        setTimeout(() => dispatch(stopBarking()), 2_000);
      }
    }, BARK_INTERVAL_MS);

    const poopTimer = setInterval(() => {
      if (Math.random() < 0.15) {
        dispatch(startPooping());
        setTimeout(() => dispatch(stopPooping()), 2_500);
      }
    }, POOP_INTERVAL_MS);

    return () => {
      clearInterval(walkTimer);
      clearInterval(barkTimer);
      clearInterval(poopTimer);
    };
  }, [dispatch]);

  /* 🧼  Passive cleanliness decay  -------------------------------------- */
  useEffect(() => {
    const decayTimer = setInterval(() => {
      dispatch(updateCleanliness());
    }, CLEANLINESS_INTERVAL_MS);

    return () => clearInterval(decayTimer);
  }, [dispatch]);

  return null; // logic-only component
}
