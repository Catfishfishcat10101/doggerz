// src/components/UI/PoopScoop.jsx
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { batheDog } from "../../redux/dogSlice";

export default function PoopScoop() {
  const dispatch = useDispatch();
  const cleanliness = useSelector((s) => s.dog?.cleanliness ?? 0);
  const [done, setDone] = useState(false);

  const handleScoop = () => {
    dispatch(batheDog());   // “good enough” for now; sets cleanliness=100
    setDone(true);
    setTimeout(() => setDone(false), 900);
  };

  const disabled = cleanliness >= 100;

  return (
    <div className="w-full max-w-md bg-white/10 rounded-2xl p-4 backdrop-blur">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">💩 Poop Scoop</div>
        <span className="text-xs opacity-75">Cleanliness: {Math.round(cleanliness)}%</span>
      </div>

      <button
        onClick={handleScoop}
        disabled={disabled}
        className={`mt-3 w-full py-2 rounded-xl text-white transition
          ${disabled ? "bg-white/20 cursor-not-allowed" : "bg-emerald-500 hover:bg-emerald-600"}`}
      >
        {disabled ? "All Clean" : "Scoop Poop"}
      </button>

      {done && <div className="mt-2 text-emerald-300 text-sm">Area cleaned! 🧹</div>}
    </div>
  );
}
