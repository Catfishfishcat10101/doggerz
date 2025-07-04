import React from "react";
import { useSelector } from "react-redux";

const Tricks = () => {
  const tricks = useSelector((state) => state.dog.tricksLearned || []);

  return (
    <div className="my-4 text-center bg-white/10 backdrop-blur-md p-4 rounded shadow-md w-64 text-white">
      <h3 className="text-lg font-bold mb-2">🎓 Tricks</h3>

      {tricks.length === 0 ? (
        <p className="text-sm text-white/70 italic">
          Your dog hasn't learned any tricks yet!
        </p>
      ) : (
        <ul className="list-disc list-inside text-sm text-white space-y-1">
          {tricks.map((trick, idx) => (
            <li key={idx}>{trick}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Tricks;
