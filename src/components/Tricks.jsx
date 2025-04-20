import React from "react";
import { useSelector } from "react-redux";

const Tricks = () => {
  const tricks = useSelector((state) => state.dog.tricksLearned);

  const allTricks = ["sit", "roll", "speak", "high-five"];

  return (
    <div className="text-left my-4 w-full max-w-sm px-4">
      <h2 className="text-lg font-bold mb-2">🎓 Tricks</h2>
      <ul className="list-disc list-inside">
        {allTricks.map((trick) => (
          <li key={trick} className={tricks.includes(trick) ? "text-green-400 font-semibold" : "text-gray-400"}>
            {trick.charAt(0).toUpperCase() + trick.slice(1)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tricks;
