// src/components/Features/Affection.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { earnCoins } from "../../redux/dogSlice";
import SoundManager from "./SoundManager";

export default function Affection() {
  const dispatch = useDispatch();
  const [pets, setPets] = useState(0);

  const petDog = () => {
    setPets((p) => p + 1);
    SoundManager.play("bark");
    // reward tiny coin every 5 pets to make it feel good
    if ((pets + 1) % 5 === 0) dispatch(earnCoins(1));
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold text-rose-900">Affection</h3>
      <p className="text-sm text-rose-900/70">Tap to pet your dog. Every 5 pets → +1 coin.</p>

      <button
        onClick={petDog}
        className="mt-4 w-full px-4 py-3 rounded-xl bg-rose-600 text-white active:scale-95"
      >
        🐶 Give Belly Rub ({pets})
      </button>
    </div>
  );
}