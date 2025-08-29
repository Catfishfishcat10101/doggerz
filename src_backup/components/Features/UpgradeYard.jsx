// src/components/Features/UpgradeYard.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const YARD_UPGRADES = [
  {
    id: "fence",
    name: "White Picket Fence",
    emoji: "🚧",
    description: "Keeps your pup safe and stylish.",
  },
  {
    id: "pool",
    name: "Doggie Pool",
    emoji: "🏊‍♂️",
    description: "Cool off on hot days—plus, splash fun!",
  },
  {
    id: "tree",
    name: "Shady Tree",
    emoji: "🌳",
    description: "For fetching and afternoon naps.",
  },
  {
    id: "house",
    name: "Deluxe Doghouse",
    emoji: "🏠",
    description: "All the comforts of home.",
  },
];

export default function UpgradeYard() {
  // In a real app, you'd track owned upgrades in Redux or the backend
  const [owned, setOwned] = useState([]);
  const navigate = useNavigate();

  const buyUpgrade = (upgrade) => {
    if (!owned.includes(upgrade.id)) {
      setOwned([...owned, upgrade.id]);
      alert(`You added a ${upgrade.name} to your yard!`);
    } else {
      alert("Already owned!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-100 to-green-200 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-4 text-green-900">🌳 Yard Upgrades</h2>
        <div className="grid grid-cols-2 gap-4">
          {YARD_UPGRADES.map((upgrade) => (
            <div
              key={upgrade.id}
              className={`border rounded-xl p-4 flex flex-col items-center bg-green-50 ${
                owned.includes(upgrade.id)
                  ? "opacity-60 border-gray-400"
                  : "border-green-300"
              }`}
            >
              <span className="text-4xl mb-2">{upgrade.emoji}</span>
              <span className="font-semibold">{upgrade.name}</span>
              <span className="text-xs text-gray-600">{upgrade.description}</span>
              <button
                className={`mt-2 px-3 py-1 rounded ${
                  owned.includes(upgrade.id)
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-400 text-white hover:bg-green-500"
                }`}
                disabled={owned.includes(upgrade.id)}
                onClick={() => buyUpgrade(upgrade)}
              >
                {owned.includes(upgrade.id) ? "Owned" : "Upgrade"}
              </button>
            </div>
          ))}
        </div>
        <button
          className="mt-6 bg-green-400 hover:bg-green-500 text-white px-4 py-2 rounded-lg"
          onClick={() => navigate("/game")}
        >
          ← Back to Game
        </button>
      </div>
    </div>
  );
}
