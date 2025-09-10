// src/components/Features/Breeding.jsx
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  addCoins,
  addXP,
  selectXP,
  selectCoins,
  selectUnlocks,
  setMilestone,
  spendCoins,
} from "../../redux/dogSlice";

const COST = 200;

export default function Breeding() {
  const dispatch = useDispatch();
  const { level } = useSelector(selectXP);
  const coins = useSelector(selectCoins);
  const unlocks = useSelector(selectUnlocks);
  const [msg, setMsg] = useState("");

  const locked = !unlocks.breeding; // Level < 12
  const canAfford = coins >= COST;

  const lockHint = useMemo(() => {
    if (!locked) return null;
    return (
      <div className="rounded-xl bg-white shadow p-4 text-rose-900">
        Breeding unlocks at <b>Level 12</b>. You’re Level <b>{level}</b>.  
        Keep training and caring for your pup to level up!
      </div>
    );
  }, [locked, level]);

  function handlePreview() {
    if (locked) return;
    if (!canAfford) { setMsg("Not enough coins."); return; }
    dispatch(spendCoins(COST));
    dispatch(addXP(50));
    dispatch(setMilestone({ key: "breedingPreview", value: true }));
    setMsg("Breeding preview unlocked! (Full feature coming soon.)");
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-50 to-amber-100 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 py-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-rose-900">Breeding (Preview)</h2>
        <Link to="/game" className="px-3 py-2 rounded-xl bg-white shadow hover:shadow-md active:scale-95">← Back to Game</Link>
      </div>

      <div className="w-full max-w-4xl px-4 space-y-4">
        {lockHint}

        <div className="rounded-2xl bg-white shadow p-5">
          <div className="text-rose-900">
            Pair your dog with a partner to preview puppy genetics (coming soon).
            For now, unlock the preview and earn XP.
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-rose-900 font-semibold">Cost: 🪙 {COST}</div>
            <button
              onClick={handlePreview}
              disabled={locked || !canAfford}
              className={`px-4 py-2 rounded-xl shadow ${locked || !canAfford ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-rose-600 text-white hover:shadow-md active:scale-95"}`}
            >
              Unlock Preview
            </button>
          </div>

          {!!msg && <div className="mt-3 text-rose-900">{msg}</div>}

          <div className="mt-3 text-xs text-rose-900/60">
            Full breeding (traits, litters, adoption market) will appear here after Level 12.
          </div>
        </div>
      </div>
    </div>
  );
}
