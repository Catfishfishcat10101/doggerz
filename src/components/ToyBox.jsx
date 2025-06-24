import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  playWithDog,
  addToy,
  toggleToyModal
} from "../redux/dogSlice.js";

const ToyBox = () => {
  const dispatch = useDispatch();
  const toyList = useSelector((state) => state.dog.toyList);

  const toys = [
    { name: "Ball", icon: "🧶", bonus: 5 },
    { name: "Frisbee", icon: "🥏", bonus: 10 },
    { name: "Bone", icon: "🦴", bonus: 15 },
  ];

  const handlePlay = (toy) => {
    dispatch(playWithDog({ bonus: toy.bonus }));
    dispatch(addToy(toy.name));
    dispatch(toggleToyModal(true));

    // Close modal after 2 seconds
    setTimeout(() => dispatch(toggleToyModal(false)), 2000);
  };

  return (
    <div className="my-4 text-center">
      <h3 className="text-lg font-bold mb-2">🎁 Toys</h3>
      <div className="flex gap-4 justify-center flex-wrap">
        {toys.map((toy) => (
          <button
            key={toy.name}
            onClick={() => handlePlay(toy)}
            className="bg-violet-500 hover:bg-violet-600 px-4 py-2 rounded text-white shadow font-semibold"
          >
            {toy.icon} {toy.name} (+{toy.bonus} Happy)
          </button>
        ))}
      </div>

      {/* Optional popup */}
      {useSelector((state) => state.dog.modalOpen) && (
        <div className="mt-4 bg-white/10 backdrop-blur text-white py-2 px-4 rounded shadow-md">
          🐾 Your dog played with a toy!
        </div>
      )}

      {/* Show which toys have been used */}
      <div className="mt-3 text-sm text-white/80">
        <span className="font-semibold">Used toys: </span>
        {toyList.length > 0 ? toyList.join(", ") : "None yet"}
      </div>
    </div>
  );
};

export default ToyBox;
