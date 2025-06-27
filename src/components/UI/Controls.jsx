import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  feedDog,
  playWithDog,
  increasePottyLevel,
  startWalking,
  stopWalking,
} from "../../redux/dogSlice";

const Controls = ({ onRendererToggle }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(increasePottyLevel(5));
    }, 20000);
    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="flex flex-wrap justify-center gap-4 p-4 bg-white/80 rounded-lg shawdow-lg w-full max-w 2xl mx-auto">
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

      <button
        onClick={onRendererToggle}
        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Toggle Sprite Mode
        </button>
    </div>
  );
}

export default Controls;