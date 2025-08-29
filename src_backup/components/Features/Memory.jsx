// src/components/Features/Memory.jsx
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Memory() {
  const milestones = useSelector((state) => state.dog.tricksLearned); // or state.dog.milestones if you track more
  const navigate = useNavigate();

  // Optionally, you could merge tricks, level-ups, and special moments into a "milestones" array

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-blue-900">📖 Memories</h2>
        {(!milestones || milestones.length === 0) ? (
          <p className="text-gray-700">
            No memories yet. Play with your dog to make some!
          </p>
        ) : (
          <ul className="space-y-2">
            {milestones.map((milestone, idx) => (
              <li
                key={`${typeof milestone === "string" ? milestone : JSON.stringify(milestone)}-${idx}`}
                className="bg-blue-50 rounded p-2 text-blue-800"
              >
                {typeof milestone === "string" ? milestone : String(milestone)}
              </li>
            ))}
          </ul>
        )}
        <button
          className="mt-8 bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded-lg"
          onClick={() => navigate("/game")}
        >
          ← Back to Game
        </button>
      </div>
    </div>
  );
}
