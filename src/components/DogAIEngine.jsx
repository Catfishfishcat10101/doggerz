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
} from "../redux/dogSlice";

const DogAIEngine = () => {
  const dispatch = useDispatch();
  const dog = useSelector((state) => state.dog);

  // 🧠 Behavior timing constants
  const WALK_INTERVAL = 8000;
  const BARK_INTERVAL = 12000;
  const POOP_INTERVAL = 20000;
  const CLEANLINESS_INTERVAL = 15000;

  // 🐾 Random behaviors (idle walking, barking, pooping)
  useEffect(() => {
    const walkTimer = setInterval(() => {
      if (Math.random() < 0.1) {
        dispatch(startWalking());
        setTimeout(() => dispatch(stopWalking()), 3000);
      }
    }, WALK_INTERVAL);

    const barkTimer = setInterval(() => {
      if (Math.random() < 0.2) {
        dispatch(startBarking());
        setTimeout(() => dispatch(stopBarking()), 2000);
      }
    }, BARK_INTERVAL);

    const poopTimer = setInterval(() => {
      if (Math.random() < 0.15) {
        dispatch(startPooping());
        setTimeout(() => dispatch(stopPooping()), 2500);
      }
    }, POOP_INTERVAL);

    return () => {
      clearInterval(walkTimer);
      clearInterval(barkTimer);
      clearInterval(poopTimer);
    };
  }, [dispatch]);

  // 🧼 Passive cleanliness decay
  useEffect(() => {
    const decayInterval = setInterval(() => {
      dispatch(updateCleanliness());
    }, CLEANLINESS_INTERVAL);

    return () => clearInterval(decayInterval);
  }, [dispatch]);

  return null;
};

export default DogAIEngine;