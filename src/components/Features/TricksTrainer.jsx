// src/components/Features/TricksTrainer.jsx
import React from "react";
import { useDispatch } from "react-redux";

let addXP, changeHappiness;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dogSlice = require("../../redux/dogSlice");
  addXP = dogSlice.addXP;
  changeHappiness = dogSlice.changeHappiness;
} catch {}

const TRICKS = [
  { key: "sit", name: "Sit", xp: 6, mood: 2 },
  { key: "stay", name: "Stay", xp: 7, mood: 2 },
  { key: "roll", name: "Roll Over", xp: 10, mood: 3 },
  { key: "hf", name: "High Five", xp: 12, mood: 4 },
  { key: "spin", name: "Spin", xp: 9, mood: 3 },
];

export default function TricksTrainer() {
  const dispatch = useDispatch();

  const train = (xp, mood) => {
    if (addXP) dispatch(addXP(xp));
    if (changeHappiness) dispatch(changeHappiness(mood));
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 p-5 rounded-2xl bg-white shadow border border-emerald-100">
      <h2 className="text-xl font-bold text-emerald-900 mb-3">🎓 Tricks Trainer</h2>
      <div className="flex flex-wrap gap-2">
        {TRICKS.map((t) => (
          <button
            key={t.key}
            onClick={() => train(t.xp, t.mood)}
            className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-800 hover:shadow active:scale-95"
            title={`+${t.xp} XP, +${t.mood} happiness`}
          >
            {t.name}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-emerald-900/70">
        Training gives XP and boosts happiness. Harder tricks award more XP.
      </p>
    </div>
  );
}