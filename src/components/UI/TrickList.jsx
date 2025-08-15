// src/components/UI/TrickList.jsx
import React from "react";
import { useSelector } from "react-redux";

export default function TrickList() {
  const tricks = useSelector((state) => state.dog.tricksLearned);

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded shadow-md w-full mx-auto text-white">
      <h3 className="text-lg font-bold mb-2">🎓 Learned Tricks</h3>
      {(!tricks || tricks.length === 0) ? (
        <p className="text-sm text-white/70">
          No tricks learned yet. Train your dog to unlock tricks!
        </p>
      ) : (
        <ul className="list-disc list-inside text-sm space-y-1">
          {tricks.map((trick) => (
            <li key={trick}>{trick}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

