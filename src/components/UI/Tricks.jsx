// src/components/UI/Tricks.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { addXP, changeHappiness } from "../../redux/dogSlice";

const TrickButton = ({ label, onTrain }) => (
  <button
    onClick={onTrain}
    className="px-4 py-2 rounded-xl bg-white shadow hover:shadow-md active:scale-95"
  >
    {label}
  </button>
);

export default function Tricks() {
  const dispatch = useDispatch();

  const train = (xp = 5, mood = 2) => () => {
    dispatch(addXP(xp));
    dispatch(changeHappiness(mood));
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-emerald-50 border border-emerald-900/10 rounded-2xl shadow p-4">
      <div className="font-semibold text-emerald-900 mb-3">Tricks Trainer</div>
      <div className="flex flex-wrap gap-2">
        <TrickButton label="Sit" onTrain={train(5, 2)} />
        <TrickButton label="Stay" onTrain={train(6, 2)} />
        <TrickButton label="Roll Over" onTrain={train(8, 3)} />
        <TrickButton label="High Five" onTrain={train(10, 4)} />
      </div>
      <p className="mt-2 text-xs text-emerald-900/70">
        Training grants XP and boosts happiness a little. Harder tricks give more XP.
      </p>
    </div>
  );
}
