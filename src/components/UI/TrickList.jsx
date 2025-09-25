import React, { useState } from "react";
const all = ["Sit", "Stay", "Roll Over", "High Five"];
export default function TrickList({ learnedTricks = [], onLearnTrick = () => {} }) {
  const [next, setNext] = useState(all.find(t => !learnedTricks.includes(t)) || "");
  return (
    <div className="rounded-xl border border-slate-700 p-4">
      <div className="font-semibold mb-2">Tricks</div>
      <div className="text-xs opacity-70 mb-2">Learned: {learnedTricks.join(", ") || "None"}</div>
      <button className="rounded-lg bg-slate-800 hover:bg-slate-700 px-3 py-2 text-sm disabled:opacity-50"
        disabled={!next}
        onClick={() => { onLearnTrick(next); setNext(all.find(t => !learnedTricks.includes(t) && t !== next) || ""); }}>
        Learn {next || "—"}
      </button>
    </div>
  );
}
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import useGameClock from "./useGameClock";
import { tickNeeds, setPosition, setDirection, setMoving } from "@/redux/dogSlice";
