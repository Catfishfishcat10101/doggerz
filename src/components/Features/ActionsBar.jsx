import React from "react";
import { useDispatch } from "react-redux";
import { feed, play, wash, rest } from "@/redux/dogSlice";
import { earn } from "@/redux/economySlice";
import { progress } from "@/redux/questSlice";

function Btn({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 active:scale-[.98] text-white font-medium shadow"
    >
      {label}
    </button>
  );
}

export default function ActionsBar() {
  const d = useDispatch();
  const action = (fn, key) => () => { d(fn()); d(earn(3)); d(progress(key)); };

  return (
    <div className="flex flex-wrap gap-3">
      <Btn label="Feed" onClick={action(feed, "feed")} />
      <Btn label="Play" onClick={action(play, "play")} />
      <Btn label="Wash/Scoop" onClick={action(wash, "wash")} />
      <Btn label="Rest" onClick={action(rest, "rest")} />
    </div>
  );
}