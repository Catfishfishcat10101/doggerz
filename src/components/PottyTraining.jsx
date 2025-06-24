import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { increasePottyLevel } from "../redux/dogSlice.js";

const PottyTraining = () => {
  const dispatch = useDispatch();
  const { isPottyTrained, pottyLevel } = useSelector((state) => state.dog);

  const handleTrainClick = () => {
    if (!isPottyTrained) {
      dispatch(increasePottyLevel(20)); // 🧠 Boost training by 20 each click
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-md shadow-md w-full max-w-sm text-white text-center mt-4">
      <h2 className="text-lg font-bold mb-2">🚽 Potty Training</h2>

      <div className="w-full h-4 bg-gray-700 rounded-full mb-2">
        <div
          className="h-full bg-lime-400 rounded-full transition-all duration-300"
          style={{ width: `${pottyLevel}%` }}
        />
      </div>

      <p className="mb-3">
        {isPottyTrained ? "✅ Your dog is fully potty trained!" : "Still learning..."}
      </p>

      {!isPottyTrained && (
        <button
          onClick={handleTrainClick}
          className="bg-lime-500 hover:bg-lime-600 text-black font-bold py-1 px-4 rounded transition"
        >
          Train to go outside
        </button>
      )}
    </div>
  );
};

export default PottyTraining;