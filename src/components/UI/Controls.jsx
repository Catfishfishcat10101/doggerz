import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  feedDog,
  playWithDog,
  increasePottyLevel,
  startWalking,
  stopWalking,
} from "../../redux/dogSlice";

export default function Controls() {
  const dispatch = useDispatch();

  // Increase potty need every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(increasePottyLevel(5));
    }, 20000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div style={{ padding: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
      <button
        onClick={() => dispatch(feedDog())}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Feed
      </button>

      <button
        onClick={() => dispatch(playWithDog())}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Play
      </button>

      <button
        onClick={() => dispatch(increasePottyLevel(10))}
        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
      >
        Potty +10
      </button>

      <button
        onClick={() => {
          dispatch(startWalking());
          setTimeout(() => dispatch(stopWalking()), 3000);
        }}
        className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
      >
        Walk
      </button>
    </div>
  );
}