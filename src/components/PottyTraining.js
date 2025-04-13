import React from "react";
import { useDispatch, useSelector } from 'react-redux';
import { pottyTrain } from '../redux/dogSlice';

const PottyTraining = () => {
  const dispatch = useDispatch();
  const pottyTrained = useSelector((state) => state.dog.pottyTrained);

  return (
    <div>
      <h2>Potty Training</h2>
      <button onClick={() => dispatch(pottyTrain())}>
        Train to go outside
        </button>
        <p>{pottyTrained ? "Your dog is potty trained!" : "Still learning..."}</p>
        </div>
  );
};

export default PottyTraining;
