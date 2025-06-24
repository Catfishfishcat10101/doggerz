import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  playWithDog,
  addToy,
  toggleToyModal
} from "../redux/dogSlice.js";

const ToyBox = () => {
  const dispatch = useDispatch();
  const toylist = useSelector((state) => state.dog.toylist);
  const modalOpen = useSelector((state) => state.dog.modalOpen);
  const level = useSelector((state) => state.dog.level);

  const toys = [
    { name: "Ball", icon: "🧶", bonus: 5, unlockLevel: 0 },
    { name: "Frisbee", icon: "🥏", bonus: 10, unlockLevel: 2 },
    { name: "Bone", icon: "🦴", bonus: 15, unlockLevel: 4 },
  ];

  const handlePlay = (toy) => {
    dispatch(playWithDog({ bonus: toy.bonus }));
    dispatch(addToy(toy.name));
    dispatch(toggleToyModal(true));
    setTimeout(() => dispatch(toggleToyModal(false)), 2000);
  };

  return (
    <div className="my-4 text-center">
      <h3 className="text-lg font-bold mb-2 text-white">🎁 Toys</h3>

      <div className="flex gap-4 justify-center flex-wrap">
        {toys.map((toy) => {
          const unlocked = level >= toy.unlockLevel;
          return (
            <button
              key={toy.name}
              onClick={() => unlocked && handlePlay(toy)}
              disabled={!unlocked}
              className={`px-4 py-2 rounded shadow font-semibold transition ${
                unlocked
                  ? "bg-violet-500 hover:bg-violet-600 text-white"
                  : "bg-gray-500 text-gray-300 cursor-not-allowed"
              }`}
              title={
                unlocked
                  ? `Play with ${toy.name}`
                  : `Unlock at level ${toy.unlockLevel}`
              }
            >
              {toy.icon} {toy.name}
              {unlocked && ` (+${toy.bonus} Happy)`}
            </button>
          );
        })}
      </div>

      {modalOpen && (
        <div className="mt-4 bg-white/10 backdrop-blur text-white py-2 px-4 rounded shadow-md">
          🐾 Your dog played with a toy!
        </div>
      )}

      <div className="mt-3 text-sm text-white/80">
        <span className="font-semibold">Used toys:</span>{" "}
        {toylist.length > 0 ? toylist.join(", ") : "None yet"}
      </div>
    </div>
  );
};

export default ToyBox;