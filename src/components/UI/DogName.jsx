import React from "react";
import { useDispatch, useSelector } from "react-redux";

export default function DogName() {
  const dispatch = useDispatch();
  const name = useSelector((s) => s.dog?.name ?? "Pupper");

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs opacity-70">Name:</span>
      <input
        className="bg-slate-900/40 border border-slate-700 rounded-xl px-3 py-1 text-sm"
        value={name}
        onChange={(e) =>
          dispatch({ type: "dog/setName", payload: { name: e.target.value } })
        }
        placeholder="Your dog's name"
      />
    </div>
  );
}
