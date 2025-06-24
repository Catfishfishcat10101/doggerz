// src/components/ResetGame.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { resetDog } from "../redux/dogSlice.js";

export default function ResetGame() {
  const dispatch = useDispatch();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your dog and all progress?")) {
      dispatch(resetDog());
    }
  };

  return (
    <div className="mt-6 text-center">
      <button
        onClick={handleReset}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded shadow transition"
      >
        🔁 Reset Game
      </button>
    </div>
  );
}