import React from "react";
import { useDispatch } from "react-redux";
import { batheDog } from "../redux/dogSlice";

const PoopScoop = ({ clearPoops }) => {
  const dispatch = useDispatch();

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={clearPoops}
        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        🧹 Clean Poop
      </button>
      <button
        onClick={() => dispatch(batheDog())}
        className="bg-cyan-600 text-white px-4 py-2 rounded hover:bg-cyan-700"
      >
        🛁 Bathe Dog
      </button>
    </div>
  );
};

export default PoopScoop;