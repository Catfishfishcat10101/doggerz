// src/components/UI/ToyBox.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { addXP, changeHappiness } from "../../redux/dogSlice";

const Toy = ({ name, mood, xp, onPlay }) => (
  <button
    onClick={onPlay}
    className="px-4 py-2 rounded-xl bg-white shadow hover:shadow-md active:scale-95"
    title={`+${mood} happiness, +${xp} XP`}
  >
    {name}
  </button>
);

export default function ToyBox() {
  const dispatch = useDispatch();
  const play = (mood, xp) => () => {
    dispatch(changeHappiness(mood));
    dispatch(addXP(xp));
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow p-4">
      <div className="font-semibold text-emerald-900 mb-3">Toy Box</div>
      <div className="flex flex-wrap gap-2">
        <Toy name="Tennis Ball 🎾" mood={3} xp={2} onPlay={play(3, 2)} />
        <Toy name="Chew Toy 🦴" mood={2} xp={1} onPlay={play(2, 1)} />
        <Toy name="Frisbee 🥏" mood={4} xp={3} onPlay={play(4, 3)} />
      </div>
    </div>
  );
}
