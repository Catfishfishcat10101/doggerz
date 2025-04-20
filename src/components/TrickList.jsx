// src/components/TrickList.jsx
import React from 'react';
import { useSelector } from 'react-redux';

function TrickList() {
  const unlockedTricks = useSelector(state => state.dog.unlockedTricks);
  
  return (
    <div>
      <h3>Unlocked Tricks:</h3>
      <ul>
        {unlockedTricks.map(trick => <li key={trick}>{trick}</li>)}
      </ul>
    </div>
  );
}

export default TrickList;
