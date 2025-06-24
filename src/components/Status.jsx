import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";

const Bar = ({ label, value, color, tooltip, animate }) => (
  <div className="w-64 my-2">
    <div className="text-sm text-white flex justify-between mb-1">
      <span>{label}</span>
      <span>{value}/100</span>
    </div>
    <div
      className="w-full bg-gray-700 rounded h-4 overflow-hidden"
      title={tooltip}
    >
      <div
        className={`h-full ${color} transition-all duration-500 ${animate ? "ring-2 ring-offset-1 ring-white" : ""}`}
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

const Status = () => {
  const { happiness, energy, xp, level } = useSelector((state) => state.dog);
  const [xpFlash, setXpFlash] = useState(false);
  const prevXP = useRef(xp);

  const xpRequired = level * 100;
  const xpPercent = Math.min(100, Math.floor((xp / xpRequired) * 100));

  useEffect(() => {
    if (xp > prevXP.current) {
      setXpFlash(true);
      const timeout = setTimeout(() => setXpFlash(false), 500);
      return () => clearTimeout(timeout);
    }
    prevXP.current = xp;
  }, [xp]);

  return (
    <div className="my-4 text-white text-sm flex flex-col items-center gap-2">
      <Bar label="Happiness" value={happiness} color="bg-pink-400" />
      <Bar label="Energy" value={energy} color="bg-blue-400" />
      <Bar
        label={`XP (Lvl ${level})`}
        value={xpPercent}
        color="bg-green-500"
        animate={xpFlash}
        tooltip={`XP: ${xp} / ${xpRequired}`}
      />
    </div>
  );
};

export default Status;
