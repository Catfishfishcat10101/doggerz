// src/components/Features/TricksTrainer.jsx
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { earnCoins } from "../../redux/dogSlice";
import SoundManager from "./SoundManager";

const TRICKS = [
  { id: "sit", title: "Sit", diff: 1, reward: 3 },
  { id: "paw", title: "Shake/Paw", diff: 2, reward: 5 },
  { id: "roll", title: "Roll Over", diff: 3, reward: 8 },
];

export default function TricksTrainer() {
  const dispatch = useDispatch();
  const [progress, setProgress] = useState({}); // {trickId: 0..100}

  const train = (t) => {
    const prev = progress[t.id] ?? 0;
    const delta = 20 - t.diff * 4; // harder tricks progress slower
    const next = Math.min(100, prev + delta);

    const nextState = { ...progress, [t.id]: next };
    setProgress(nextState);

    if (next >= 100) {
      dispatch(earnCoins(t.reward));
      SoundManager.play("click");
      setTimeout(() => setProgress({ ...nextState, [t.id]: 0 }), 300);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h3 className="text-lg font-semibold text-rose-900">Tricks Trainer</h3>
      <p className="text-sm text-rose-900/70">Train tricks to earn coins.</p>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {TRICKS.map((t) => {
          const p = progress[t.id] ?? 0;
          return (
            <div key={t.id} className="rounded-xl border border-rose-100 p-4">
              <div className="font-semibold text-rose-900">{t.title}</div>
              <div className="text-xs text-rose-900/60">Difficulty {t.diff} • Reward {t.reward}💰</div>

              <div className="h-2 bg-rose-100 rounded mt-2 overflow-hidden">
                <div className="h-full bg-rose-600" style={{ width: `${p}%` }} />
              </div>

              <button
                onClick={() => train(t)}
                className="mt-3 w-full px-3 py-2 rounded-lg bg-rose-600 text-white active:scale-95"
              >
                Practice
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}