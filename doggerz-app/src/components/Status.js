import React from "react";
import { useSelector } from "react-redux";

const Status = () => {
  const { happiness, energy, age } =useSelector((state) => state.dog);

  return (
    <div>
      <h3>Status</h3>
      <p>Happiness: {happiness}%</p>
      <p>Energy: {energy}%</p>
      <p>Age: {age}years</p>
      </div>
  );
};

export default Status;
