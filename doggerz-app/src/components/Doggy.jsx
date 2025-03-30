import React, { useContext } from 'react';
import { DogContext } from '../context/DogContext';
import sprite from '../assets/sprite.png';

export default function Doggy() {
  const { happiness, energy } = useContext(DogContext);

  return (
    <div className="doggy">
      <img src={sprite} alt="Doggy" width="120" />
      <p>Happiness: {happiness}</p>
      <p>Energy: {energy}</p>
    </div>
  );
}
