import React from "react";
import { useDispatch } from "react-redux";
import { resetDogState, increasePottyLevel } from "@/../redux/dogSlice";

const ResetGame = () => {
  const dispatch = useDispatch();

  const handleTrainClick = () => {
    if (!isPottyTrained && pottyLevel < 100) {
      dispatch(increasePottyLevel(20));
    }
  };

  return (
    <div>
      <button
        className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
        onClick={() => dispatch(resetDogState())}
      >
        Reset Game
      </button>
      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        onClick={handleTrainClick}
      >
        Train Dog
      </button>
    </div>
  );
};

export default ResetGame;
