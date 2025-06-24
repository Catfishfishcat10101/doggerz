import React from 'react';
import { useSelector } from 'react-redux';

const ALL_TRICKS = ["Sit", "Stay", "Roll Over", "Shake", "Fetch"];

const TrickList = () => {
  const unlockedTricks = useSelector((state) => state.dog.tricksLearned || []);
  const total = ALL_TRICKS.length;
  const learned = unlockedTricks.length;
  const progress = Math.floor((learned / total) * 100);

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded shadow-md max-w-sm w-full mx-auto text-white mt-4">
      <h3 className="text-lg font-bold mb-2">🎓 Learned Tricks</h3>

      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded h-4 mb-3 overflow-hidden shadow-inner" title={`${learned}/${total} tricks`}>
        <div
          className="h-full bg-indigo-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {learned === 0 ? (
        <p className="text-sm text-white/70">No tricks learned yet. Train your dog to unlock tricks!</p>
      ) : (
        <ul className="list-disc list-inside text-sm space-y-1">
          {unlockedTricks.map((trick) => (
            <li key={trick}>{trick}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrickList;