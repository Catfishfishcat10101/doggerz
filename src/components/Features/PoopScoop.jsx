import React from "react";
import { useDispatch } from "react-redux";
import { batheDog } from "../../redux/dogSlice";

const PoopScoop = ({ clearPoops }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex flex-wrap gap-4 mt-4 justify-center">
      <button
        onClick={clearPoops}
        className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded shadow transition"
        aria-label="Clean up dog poop"
      >
        🧹 Clean Poop
      </button>

      <button
        onClick={() => dispatch(batheDog())}
        className="bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-5 py-2 rounded shadow transition"
        aria-label="Bathe your dog"
      >
        🛁 Bathe Dog
      </button>
    </div>
  );
};

export default PoopScoop;
