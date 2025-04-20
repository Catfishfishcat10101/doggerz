import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { learnTrick } from "../redux/dogSlice";

const Tricks = () => {
  const dispatch = useDispatch();
  const tricks = useSelector((state) => state.dog.tricksLearned);
  const [newTrick, setNewTrick] = useState("");

  const handleLearn = () => {
    if (newTrick.trim()) {
      dispatch(learnTrick(newTrick.trim()));
      setNewTrick("");
    }
  };

  return (
    <div className="max-w-xs mx-auto mt-6 p-4 bg-slate-600 rounded shadow text-white">
      <h2 className="text-lg font-semibold mb-3 text-center">🎓 Tricks</h2>
      <input
        type="text"
        value={newTrick}
        onChange={(e) => setNewTrick(e.target.value)}
        className="w-full p-2 mb-2 rounded text-black"
        placeholder="Enter a new trick..."
      />
      <button
        onClick={handleLearn}
        className="bg-green-500 hover:bg-green-600 w-full py-2 rounded"
      >
        Teach Trick
      </button>
      <ul className="mt-4 list-disc list-inside text-sm">
        {tricks.length === 0 && <li>No tricks yet!</li>}
        {tricks.map((trick, i) => (
          <li key={i}>🐕 {trick}</li>
        ))}
      </ul>
    </div>
  );
};

export default Tricks;
