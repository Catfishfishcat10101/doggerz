// src/components/NotFound.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">404</h2>
        <p className="text-lg text-gray-700 mb-6">
          Uh oh! That page doesn't exist in Doggerz.
        </p>
        <button
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-xl font-bold"
          onClick={() => navigate("/game")}
        >
          Back to Game
        </button>
      </div>
    </div>
  );
}
