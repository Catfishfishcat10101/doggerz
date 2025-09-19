// src/components/UI/Status.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectPos, selectDirection, selectHappiness } from "../../redux/dogSlice";

export default function Status() {
  const pos = useSelector(selectPos);
  const dir = useSelector(selectDirection);
  const happiness = useSelector(selectHappiness);

  return (
    <div className="w-full max-w-3xl mx-auto mt-3 bg-white rounded-2xl shadow p-4 text-sm text-emerald-900">
      <div className="grid grid-cols-3 gap-4">
        <div>Position: <span className="font-mono">{Math.round(pos.x)}, {Math.round(pos.y)}</span></div>
        <div>Facing: <span className="capitalize">{dir}</span></div>
        <div>Happiness: <span>{Math.round(happiness)}%</span></div>
      </div>
    </div>
  );
}
