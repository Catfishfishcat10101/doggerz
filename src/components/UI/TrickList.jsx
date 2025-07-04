import React from 'react';
import { useSelector } from 'react-redux';

const TrickList = () => {
  const unlockedTricks = useSelector((state) => state.dog.tricksLearned || []);

  return (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded shadow-md max-w-sm w-full mx-auto text-white mt-4">
      <h3 className="text-lg font-bold mb-2">🎓 Learned Tricks</h3>

      {unlockedTricks.length === 0 ? (
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