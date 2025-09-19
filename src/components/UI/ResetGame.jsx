// src/components/UI/ResetGame.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { setHappiness } from "../../redux/dogSlice";

export default function ResetGame() {
  const dispatch = useDispatch();

  const reset = () => {
    if (!confirm("Reset basic mood to default? (Non-destructive)")) return;
    dispatch(setHappiness(50));
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-emerald-900">Reset (soft)</div>
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-red-500 text-white shadow hover:shadow-md active:scale-95"
        >
          Reset Mood
        </button>
      </div>
      <p className="mt-2 text-xs text-emerald-900/70">
        This soft reset only sets happiness to a middle value. Hook up your own <code>resetGame()</code> action here if you have one.
      </p>
    </div>
  );
}
