import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const Progress = ({ label, value, color }) => (
  <div className="w-full my-2">
    <label className="text-xs font-semibold text-white flex justify-between">
      <span>{label}</span>
      <span>{value}/100</span>
    </label>
    <div className="w-full bg-gray-200 h-4 rounded shadow-inner overflow-hidden">
      <div
        className={`h-4 ${color} transition-all duration-300 ease-in-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const StatsBar = () => {
  const { happiness, energy, xp, level } = useSelector((state) => state.dog);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const xpPercent = Math.min(100, Math.floor((xp / (level * 100)) * 100));

  useEffect(() => {
    if (xpPercent === 100) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [xpPercent]);

  return (
    <div className="relative w-full max-w-sm px-4 py-2 bg-white/10 backdrop-blur-md rounded-lg shadow-md overflow-hidden">
      {showLevelUp && (
        <div className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 level-up text-xl font-bold text-yellow-300 drop-shadow">
          🎉 LEVEL UP!
        </div>
      )}
      <Progress label="Happiness" value={happiness} color="bg-yellow-400" />
      <Progress label="Energy" value={energy} color="bg-green-400" />
      <Progress label={`XP (Level ${level})`} value={xpPercent} color="bg-blue-500" />
    </div>
  );
};

export default StatsBar;