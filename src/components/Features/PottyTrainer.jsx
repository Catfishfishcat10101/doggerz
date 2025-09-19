// src/components/Features/PottyTrainer.jsx
import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";

let addXP, changeHappiness;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dogSlice = require("../../redux/dogSlice");
  addXP = dogSlice.addXP;
  changeHappiness = dogSlice.changeHappiness;
} catch {}

const STEPS = [
  { key: "sniff", label: "Sniff Spot", xp: 4, mood: 2, desc: "Guide your pup to sniff an appropriate spot." },
  { key: "wait", label: "Wait Signal", xp: 5, mood: 1, desc: "Hold the leash and give a patient wait cue." },
  { key: "go", label: "Go Potty!", xp: 8, mood: 3, desc: "Give the ‘Go Potty’ cue and praise." },
  { key: "reward", label: "Reward", xp: 6, mood: 4, desc: "Treat + praise immediately after success." },
];

export default function PottyTrainer() {
  const dispatch = useDispatch();
  const [done, setDone] = useState({});

  const progress = useMemo(() => {
    const c = Object.values(done).filter(Boolean).length;
    return Math.round((c / STEPS.length) * 100);
  }, [done]);

  const completeStep = (s) => {
    setDone((d) => ({ ...d, [s.key]: true }));
    if (addXP) dispatch(addXP(s.xp));
    if (changeHappiness) dispatch(changeHappiness(s.mood));
  };

  const reset = () => setDone({});

  return (
    <div className="max-w-3xl mx-auto mt-6 p-5 rounded-2xl bg-white shadow border border-emerald-100">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-emerald-900">🚽 Potty Trainer</h2>
        <div className="text-sm text-emerald-800">
          Progress: <span className="font-semibold">{progress}%</span>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {STEPS.map((s) => {
          const isDone = !!done[s.key];
          return (
            <div
              key={s.key}
              className={`p-4 rounded-xl border ${
                isDone ? "bg-emerald-50 border-emerald-200" : "bg-white border-emerald-100"
              } flex items-center justify-between`}
            >
              <div>
                <div className="font-semibold text-emerald-900">{s.label}</div>
                <p className="text-sm text-emerald-900/70">{s.desc}</p>
              </div>
              <button
                disabled={isDone}
                onClick={() => completeStep(s)}
                className={`px-4 py-2 rounded-xl shadow active:scale-95 ${
                  isDone
                    ? "bg-emerald-200 text-emerald-700 cursor-not-allowed"
                    : "bg-emerald-600 text-white hover:shadow-md"
                }`}
              >
                {isDone ? "Done" : `Do (+${s.xp} XP, +${s.mood} 😊)`}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-xl bg-white border border-emerald-200 text-emerald-700 hover:shadow active:scale-95"
        >
          Reset Session
        </button>
        <div className="text-xs text-emerald-900/60">
          Tip: Consistency matters. Bring your pup to the same spot after meals and naps.
        </div>
      </div>
    </div>
  );
}