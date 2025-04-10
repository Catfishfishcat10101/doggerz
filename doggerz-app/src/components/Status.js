import React from "react";
import { useSelector } from "react-redux";

const StatBar = ({ label, value, color }) => (
  <div className="mb-3">
    <div className="text-sm font-semibold">{label}: {Math.round(value)}</div>
    <div className="w-full h-4 bg-gray-300 rounded">
      <div
        className={`h-full rounded ${color}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const Status = () => {
  const { energy, happiness, age } = useSelector((state) => state.dog);

  return (
    <div className="max-w-xs mx-auto mt-4 p-4 bg-slate-800 rounded shadow text-white">
      <h2 className="text-lg font-bold text-center mb-2">🐾 Dog Status</h2>
      <StatBar label="Energy" value={energy} color="bg-green-500" />
      <StatBar label="Happiness" value={happiness} color="bg-yellow-400" />
      <div className="text-sm text-center mt-3">Age: {age} mins old</div>
    </div>
  );
};

export default Status;
