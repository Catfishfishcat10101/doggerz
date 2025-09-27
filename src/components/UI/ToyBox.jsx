import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { earnCoins, selectCoins } from "@/../redux/dogSlice";
import SoundManager from "@/Features/SoundManager";

const TOYS = [
  { id: "ball", icon: "🎾", title: "Ball", reward: 1 },
  { id: "bone", icon: "🦴", title: "Bone", reward: 2 },
  { id: "rope", icon: "🪢", title: "Rope", reward: 1 },
];

export default function ToyBox() {
  const dispatch = useDispatch();
  const coins = useSelector(selectCoins);

  const play = (t) => {
    SoundManager.play("click");
    dispatch(earnCoins(t.reward));
  };

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-rose-900">Toy Box</h3>
        <div className="text-sm px-2 py-1 rounded bg-rose-100 text-rose-900">💰 {coins}</div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-3">
        {TOYS.map((t) => (
          <button
            key={t.id}
            onClick={() => play(t)}
            className="px-3 py-4 rounded-xl bg-rose-100 text-rose-900 hover:shadow active:scale-95 flex flex-col items-center"
          >
            <div className="text-2xl">{t.icon}</div>
            <div className="text-xs">{t.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}