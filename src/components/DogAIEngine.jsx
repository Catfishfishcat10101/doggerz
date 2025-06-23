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

  // Handle random walk, bark, poop
  useEffect(() => {
    const walkTimer = setInterval(() => {
      if (Math.random() < 0.1) {
        dispatch(startWalking());
        setTimeout(() => dispatch(stopWalking()), 3000);
      }
    }, 8000);

    const barkTimer = setInterval(() => {
      if (Math.random() < 0.2) {
        dispatch(startBarking());
        setTimeout(() => dispatch(stopBarking()), 2000);
      }
    }, 12000);

    const poopTimer = setInterval(() => {
      if (Math.random() < 0.15) {
        dispatch(startPooping());
        setTimeout(() => dispatch(stopPooping()), 2500);
      }
    }, 20000);

    return () => {
      clearInterval(walkTimer);
      clearInterval(barkTimer);
      clearInterval(poopTimer);
    };
  }, [dispatch]);

  // Handle passive cleanliness decay
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(updateCleanliness());
    }, 15000); // 🔁 Simulated check every 15 seconds (adjust for real-time)

    return () => clearInterval(interval);
  }, [dispatch]);

  return null;
};

export default DogAIEngine;