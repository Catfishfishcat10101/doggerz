import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

const Progress = ({ label, value, color, tooltip, animate }) => (
  <div className="w-full my-2">
    <label className="text-xs font-semibold text-white flex justify-between">
      <span>{label}</span>
      <span>{value}/100</span>
    </label>
    <div className="w-full bg-gray-200 h-4 rounded shadow-inner overflow-hidden" title={tooltip}>
      <div
        className={`h-4 ${color} transition-all duration-300 ease-in-out ${
          animate ? "ring-2 ring-blue-300" : ""
        }`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const StatsBar = () => {
  const { happiness, energy, xp, level } = useSelector((state) => state.dog);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpFlash, setXpFlash] = useState(false);
  const prevXP = useRef(xp);

  const xpRequired = level * 100;
  const xpPercent = Math.min(100, Math.floor((xp / xpRequired) * 100));

  // Show level-up animation when XP hits 0 after crossing threshold
  useEffect(() => {
    if (xp === 0 && prevXP.current >= xpRequired) {
      setShowLevelUp(true);
      const timeout = setTimeout(() => setShowLevelUp(false), 3000);
      return () => clearTimeout(timeout);
    }
    prevXP.current = xp;
  }, [xp, xpRequired]);

  // Flash XP bar briefly when XP increases
  useEffect(() => {
    if (xp > prevXP.current) {
      setXpFlash(true);
      const timeout = setTimeout(() => setXpFlash(false), 500);
      return () => clearTimeout(timeout);
    }
  }, [xp]);

  return (
    <div className="relative w-full max-w-sm px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg shadow-md text-white">
      {showLevelUp && (
        <div className="absolute top-[-32px] left-1/2 transform -translate-x-1/2 animate-floatUp text-xl font-bold text-yellow-300 drop-shadow">
          🎉 LEVEL UP!
        </div>
      )}

      <Progress label="Happiness" value={happiness} color="bg-yellow-400" />
      <Progress label="Energy" value={energy} color="bg-green-400" />
      <Progress
        label={`XP (Level ${level})`}
        value={xpPercent}
        color="bg-blue-500"
        animate={xpFlash}
        tooltip={`XP: ${xp} / ${xpRequired}`}
      />
    </div>
  );
};

export default StatsBar;