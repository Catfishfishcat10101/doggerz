// src/components/Features/Breeding.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { selectDogLevel } from "../../redux/dogSlice";

export default function Breeding() {
  const level = useSelector(selectDogLevel);
  const unlocked = level >= 12;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-rose-100">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-rose-900">Breeding (Stub)</h1>
          <Link className="bg-white px-3 py-2 rounded-xl shadow" to="/game">← Back</Link>
        </div>

        {!unlocked ? (
          <div className="bg-white rounded-2xl shadow p-6 mt-4 text-rose-900">
            Reach <b>Level 12</b> to unlock the Breeding Center.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-6 mt-4 text-rose-900">
            This is a placeholder. Planned: pair compatible dogs, pass traits, cost coins,
            cooldowns, and litter outcomes. For now, enjoy the teaser!
          </div>
        )}
      </div>
    </div>
  );
}