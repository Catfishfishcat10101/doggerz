// src/components/Features/PottyTraining.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  increasePottyLevel,
  resetPottyLevel,
} from "../../store/dogSlice";
import { useNavigate } from "react-router-dom";

export default function PottyTraining() {
  const pottyLevel = useSelector((state) => state.dog.pottyLevel);
  const isPottyTrained = useSelector((state) => state.dog.isPottyTrained);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const trainStep = () => {
    dispatch(increasePottyLevel(15));
  };

  const resetTraining = () => {
    dispatch(resetPottyLevel());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-300 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-900">
          🚽 Potty Training
        </h2>
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">Progress:</span>
            <div className="w-full bg-gray-200 rounded h-4 overflow-hidden flex-1">
              <div
                className={`h-full rounded transition-all duration-300 ${
                  isPottyTrained ? "bg-green-600" : "bg-yellow-400"
                }`}
                style={{ width: `${pottyLevel}%` }}
              ></div>
            </div>
            <span className="font-mono w-12 text-right">
              {Math.round(pottyLevel)}%
            </span>
          </div>
          <div className="mt-2 text-gray-700">
            {isPottyTrained
              ? "Your dog is fully potty trained! 🎉"
              : "Keep training to reach 100%!"}
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold"
            onClick={trainStep}
            disabled={isPottyTrained}
          >
            Train Potty 🚾
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            onClick={resetTraining}
            disabled={pottyLevel === 0}
          >
            Reset
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg ml-auto"
            onClick={() => navigate("/game")}
          >
            ← Back to Game
          </button>
        </div>
      </div>
    </div>
  );
}
