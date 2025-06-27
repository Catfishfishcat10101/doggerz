// src/components/Features/DailyLoginReward.jsx
import React, { useEffect, useState } from "react";

export default function DailyLoginReward({ onClaim }) {
  const [claimed, setClaimed] = useState(false);

  /* check localStorage once on mount */
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem("dailyClaim");
    if (stored === today) setClaimed(true);
  }, []);

  const handleClaim = () => {
    const today = new Date().toDateString();
    localStorage.setItem("dailyClaim", today);   // persist
    setClaimed(true);
    onClaim?.();                                 // optional side-effect
  };

  return (
    <div className="p-4 bg-indigo-50 rounded shadow-md max-w-sm">
      <h2 className="text-xl font-semibold">Daily Login Reward</h2>

      {claimed ? (
        <p className="text-green-700 mt-2">Already claimed today</p>
      ) : (
        <button
          onClick={handleClaim}
          className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Claim&nbsp;Reward
        </button>
      )}
    </div>
  );
}