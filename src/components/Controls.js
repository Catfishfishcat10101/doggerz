import React from "react";
import { useDispatch } from "react-redux";
import { feed, play, toggleSound } from "../redux/dogSlice";

const Controls = () => {
  const dispatch = useDispatch();

  return (
    <div className="max-w-xs mx-auto mt-6 p-4 bg-slate-700 rounded shadow text-white space-y-2 text-center">
      <h2 className="text-lg font-semibold mb-2">🎮 Controls</h2>
      <button
        onClick={() => dispatch(feed())}
        className="bg-blue-500 hover:bg-blue-600 w-full py-2 rounded"
      >
        🍖 Feed
      </button>
      <button
        onClick={() => dispatch(play())}
        className="bg-pink-500 hover:bg-pink-600 w-full py-2 rounded"
      >
        🎾 Play
      </button>
      <button
        onClick={() => dispatch(toggleSound())}
        className="bg-gray-500 hover:bg-gray-600 w-full py-2 rounded"
      >
        🔊 Toggle Sound
      </button>
    </div>
  );
};

export default Controls;
