import React from "react";
import { useDispatch } from "react-redux";
import { feed, play, gainXP } from "../redux/dogSlice";

const Controls = () => {
  const dispatch = useDispatch();

  const handleFeed = () => {
    dispatch(feed());
    dispatch(gainXP(5)); // XP for feeding
  };

  const handlePlay = () => {
    dispatch(play());
    dispatch(gainXP(10)); // XP for playing
  };

  return (
    <div className="flex gap-4 my-4">
      <button onClick={handleFeed} className="px-4 py-2 bg-pink-500 rounded shadow hover:bg-pink-600">
        🍖 Feed
      </button>
      <button onClick={handlePlay} className="px-4 py-2 bg-orange-500 rounded shadow hover:bg-orange-600">
        🎾 Play
      </button>
    </div>
  );
};

export default Controls;
