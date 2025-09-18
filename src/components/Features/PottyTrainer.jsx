// src/components/Features/PottyTrainer.jsx
import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { earnCoins } from "../../redux/dogSlice";
import PoopRenderer from "./PoopRenderer.jsx";
import SoundManager from "./SoundManager";

let idSeq = 1;

export default function PottyTrainer() {
  const dispatch = useDispatch();
  const [outside, setOutside] = useState(false);
  const [poops, setPoops] = useState([]);

  const mood = useMemo(() => (outside ? "Ready to go! 🚽" : "Needs to go soon… ⏳"), [outside]);

  const takeOutside = () => {
    setOutside(true);
    SoundManager.play("bark");
    // 60% chance to create a poop “outside”
    if (Math.random() < 0.6) {
      setPoops((arr) => arr.concat({ id: idSeq++ }));
    }
  };

  const accidentInside = () => {
    setOutside(false);
    // small chance an “inside” poop appears
    if (Math.random() < 0.4) {
      setPoops((arr) => arr.concat({ id: idSeq++ }));
    }
  };

  const scoop = (id) => {
    setPoops((arr) => arr.filter((p) => p.id !== id));
    dispatch(earnCoins(2)); // reward scooping
    SoundManager.play("scoop");
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold text-rose-900">Potty Trainer</h3>
      <p className="text-sm text-rose-900/70">{mood}</p>

      <div className="flex items-center gap-2 mt-4">
        <button className="px-3 py-2 rounded-xl bg-rose-600 text-white active:scale-95" onClick={takeOutside}>
          🚪 Take Outside
        </button>
        <button className="px-3 py-2 rounded-xl bg-rose-100 text-rose-800 active:scale-95" onClick={accidentInside}>
          😬 Accident Inside
        </button>
      </div>

      <div className="mt-4">
        <PoopRenderer poops={poops} onScoop={scoop} />
      </div>
    </div>
  );
}