// src/components/Features/PoopRenderer.jsx
import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { scoopPoopReward, dropPoop } from "../../redux/dogSlice";

export default function PoopRenderer() {
  const poops = useSelector((state) => state.dog.poops);
  const dispatch = useDispatch();

  // Handler for removing (scooping) poop
  const scoopPoop = (poop) => {
    dispatch({
      type: "dog/poops",
      payload: poops.filter((p) => p.id !== poop.id),
    });
    dispatch(scoopPoopReward());
  };

  // Fake drop button for testing (remove in real game!)
  const dropRandomPoop = () => {
    const x = Math.floor(Math.random() * 400);
    const y = Math.floor(Math.random() * 220) + 50;
    dispatch(dropPoop({ x, y }));
  };

  return (
    <div className="relative w-full max-w-xl h-80 mx-auto mt-4 bg-green-50 rounded-xl shadow p-2">
      <h2 className="font-bold text-lg text-green-800 mb-2">💩 Dog Poops</h2>
      {poops.length === 0 ? (
        <p className="text-gray-600">No poop to clean up! Yard is fresh.</p>
      ) : (
        <div className="relative w-full h-64">
          {poops.map((poop) => (
            <div
              key={poop.id}
              className="absolute cursor-pointer"
              style={{
                left: poop.x,
                top: poop.y,
                width: 32,
                height: 32,
                fontSize: 32,
                userSelect: "none",
              }}
              title="Click to scoop!"
              onClick={() => scoopPoop(poop)}
            >
              💩
            </div>
          ))}
        </div>
      )}
      <button
        className="mt-4 bg-green-400 hover:bg-green-600 text-white px-3 py-1 rounded"
        onClick={dropRandomPoop}
      >
        Drop Poop (Demo)
      </button>
    </div>
  );
}
