import React from "react";
import { useDispatch } from "react-redux";
import { play } from "../redux/dogSlice.js";

const ToyBox = () => {
  const dispatch = useDispatch();

  const toys = [
    { name: "Ball", icon: "🧶", bonus: 5 },
    { name: "Frisbee", icon: "🥏", bonus: 10 },
    { name: "Bone", icon: "🦴", bonus: 15 },
  ];

  const handlePlay = (bonus) => {
    dispatch(play({ bonus }));
  };

  return (
    <div className="my-4 text-center">
      <h3 className="text-lg font-bold mb-2">🎁 Toys</h3>
      <div className="flex gap-4 justify-center flex-wrap">
        {toys.map((toy) => (
          <button
            key={toy.name}
            onClick={() => handlePlay(toy.bonus)}
            className="bg-violet-500 hover:bg-violet-600 px-4 py-2 rounded text-white shadow font-semibold"
          >
            {toy.icon} {toy.name} (+{toy.bonus} Happy)
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToyBox;
