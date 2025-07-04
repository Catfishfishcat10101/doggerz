import React from "react";
import { useDispatch } from "react-redux";
import { resetDogState } from "../../redux/dogSlice";

const ResetGame = () => {
  const dispatch = useDispatch();

  return (
    <button
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
      onClick={() => dispatch(resetDogState())}
    >
      Reset Game
    </button>
  );
};

export default ResetGame;
