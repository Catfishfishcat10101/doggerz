import React from "react";
import { useDispatch } from "react-redux";
import { resetGame } from "../redux/dogSlice";

const ResetGame = () => {
  const dispatch = useDispatch();

  const confirmReset = () => {
    if (window.confirm("Reset your dog and all progress?")) {
      localStorage.clear();
      dispatch(resetGame());
      window.location.reload();
    }
  };

  return (
    <div className="text-center mt-4">
      <button
        onClick={confirmReset}
        className="bg-red-600 hover:bg-red-700 px-6 py-2 text-white font-bold rounded"
      >
        🔄 Reset Game
      </button>
    </div>
  );
};

export default ResetGame;
