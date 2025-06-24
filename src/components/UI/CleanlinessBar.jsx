import React from "react";
import { useSelector } from "react-redux";

const StatusFlag = ({ label, active, color }) => (
  <div className="text-xs font-semibold flex items-center gap-1">
    <span
      className={`w-3 h-3 rounded-full transition-all duration-300 ${
        active ? color : "bg-gray-400"
      }`}
    ></span>
    <span className={active ? "opacity-100" : "opacity-50"}>{label}</span>
  </div>
);

const CleanlinessBar = () => {
  const { isDirty, hasFleas, hasMange } = useSelector((state) => state.dog);

  return (
    <div className="w-full max-w-sm px-4 py-3 bg-white/10 backdrop-blur-md rounded-lg shadow-md mt-2 text-white">
      <h3 className="text-sm font-bold mb-2 tracking-wide">🧼 Cleanliness Status</h3>
      <div className="flex justify-between gap-3">
        <StatusFlag label="Dirty" active={isDirty} color="bg-yellow-400" />
        <StatusFlag label="Fleas" active={hasFleas} color="bg-red-500" />
        <StatusFlag label="Mange" active={hasMange} color="bg-purple-600" />
      </div>
    </div>
  );
};

export default CleanlinessBar;