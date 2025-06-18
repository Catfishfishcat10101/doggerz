import React from "react";

const PoopScoop = ({ clearPoops }) => {
  return (
    <div className="my-2 text-center">
      <button
        onClick={clearPoops}
        className="bg-orange-500 hover:bg-orange-600 px-4 py-1 rounded text-white font-semibold"
      >
        🧹 Scoop Poop
      </button>
    </div>
  );
};

export default PoopScoop;
