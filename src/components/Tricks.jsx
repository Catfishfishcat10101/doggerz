import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { learnTrick } from "../redux/dogSlice";

const Tricks = () => {
  const dispatch = useDispatch();
  const { xp, tricksLearned } = useSelector((state) => state.dog);

  const allTricks = [
    { name: "Sit", cost: 10 },
    { name: "Shake", cost: 25 },
    { name: "Roll Over", cost: 40 },
    { name: "Play Dead", cost: 70 },
  ];

  return (
    <div className="text-center my-6">
      <h3 className="text-lg font-bold mb-2">🎓 Train Tricks</h3>
      <div className="flex flex-wrap justify-center gap-2">
        {allTricks.map((trick) => {
          const learned = tricksLearned.includes(trick.name);
          const canLearn = xp >= trick.cost && !learned;

          return (
            <button
              key={trick.name}
              disabled={!canLearn}
              onClick={() => dispatch(learnTrick(trick.name))}
              className={`px-4 py-1 rounded border ${
                learned
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : canLearn
                  ? "bg-indigo-500 text-white hover:bg-indigo-600"
                  : "bg-gray-700 text-gray-400 cursor-not-allowed"
              }`}
            >
              {trick.name} {learned ? "✓" : `(${trick.cost} XP)`}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tricks;
