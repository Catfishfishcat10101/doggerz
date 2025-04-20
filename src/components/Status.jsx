import React from "react";
import { useSelector } from "react-redux";

const Bar = ({ label, value, color }) => (
  <div className="w-64 my-1">
    <div className="text-sm mb-1">{label}</div>
    <div className="w-full bg-gray-700 rounded h-4 overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const Status = () => {
  const { happiness, energy, xp } = useSelector((state) => state.dog);

  return (
    <div className="my-4">
      <Bar label="Happiness" value={happiness} color="bg-pink-400" />
      <Bar label="Energy" value={energy} color="bg-blue-400" />
      <Bar label="XP" value={xp} color="bg-green-500" />
    </div>
  );
};

export default Status;
