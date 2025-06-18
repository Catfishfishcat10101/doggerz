import React from "react";
import { useSelector } from "react-redux";

const Progress = ({ label, value, color }) => (
  <div className="w-full my-1">
    <label className="text-xs font-semibold">{label}</label>
    <div className="w-full bg-gray-200 h-4 rounded">
      <div className={`h-4 rounded ${color}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

const StatsBar = () => {
  const { happiness, energy, xp } = useSelector((state) => state.dog);
  return (
    <div className="w-full max-w-sm px-4">
      <Progress label="Happiness" value={happiness} color="bg-yellow-400" />
      <Progress label="Energy" value={energy} color="bg-green-400" />
      <Progress label="XP" value={Math.min(xp, 100)} color="bg-blue-500" />
    </div>
  );
};

export default StatsBar;
