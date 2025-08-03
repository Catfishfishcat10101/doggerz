// src/components/Features/Affection.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateAffection } from "../../store/dogSlice";
import { useNavigate } from "react-router-dom";

export default function Affection() {
  const affection = useSelector((state) => state.dog.happiness);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Give affection (pet the dog)
  const giveAffection = () => {
    dispatch(updateAffection(10));
  };

  // Optionally lose affection over time or for certain actions
  const takeAffection = () => {
    dispatch(updateAffection(-10));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-pink-200 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-pink-900">💗 Affection</h2>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-semibold">Bond Level:</span>
          <div className="w-full bg-pink-200 rounded h-4 overflow-hidden flex-1">
            <div
              className="h-full rounded bg-pink-500 transition-all duration-300"
              style={{ width: `${affection}%` }}
            ></div>
          </div>
          <span className="font-mono w-12 text-right">
            {Math.round(affection)}%
          </span>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            className="bg-pink-400 hover:bg-pink-500 text-white px-4 py-2 rounded-lg font-semibold"
            onClick={giveAffection}
          >
            Pet Dog 💕
          </button>
          <button
            className="bg-pink-200 hover:bg-pink-300 text-pink-800 px-4 py-2 rounded-lg"
            onClick={takeAffection}
          >
            Ignore 😞
          </button>
          <button
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg ml-auto"
            onClick={() => navigate("/game")}
          >
            ← Back to Game
          </button>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          Showing affection helps your dog feel loved. Ignoring can make your dog sad!
        </div>
      </div>
    </div>
  );
}
