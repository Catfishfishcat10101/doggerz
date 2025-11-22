// src/components/DevToolbar.jsx
// @ts-nocheck

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetDogState, awardXp, selectDogLevelInfo } from "@/redux/dogSlice.js";
import { clearUser, addCoins } from "@/redux/userSlice.js";

export default function DevToolbar() {
  const dispatch = useDispatch();
  const lvl = useSelector(selectDogLevelInfo);

  if (!import.meta.env.DEV) return null;

  const handleUnregister = async () => {
    try {
      // @ts-ignore helper attached in main.jsx
      if (window.swUnregister) await window.swUnregister();
      // eslint-disable-next-line no-alert
      alert("SW unregistered and caches cleared");
    } catch { }
  };

  const handleResetDog = () => dispatch(resetDogState());
  const handleClearUser = () => dispatch(clearUser());
  const handleAddCoins = () => dispatch(addCoins(100));
  const handleTestLevelUp = () => {
    const xp = Number(lvl?.xp ?? 0);
    const next = Number(lvl?.nextLevelXp ?? 100);
    const delta = Math.max(1, next - xp + 1);
    dispatch(awardXp(delta));
  };

  return (
    <div className="sticky top-0 z-[60] w-full bg-amber-900/40 backdrop-blur border-b border-amber-500/30">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 py-1.5 flex items-center gap-2 text-xs text-amber-100">
        <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/40 font-semibold tracking-wide">DEV</span>
        <button onClick={handleUnregister} className="rounded bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 hover:bg-amber-500/30">Unregister SW</button>
        <button onClick={handleResetDog} className="rounded bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 hover:bg-amber-500/30">Reset Dog</button>
        <button onClick={handleClearUser} className="rounded bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 hover:bg-amber-500/30">Clear User</button>
        <button onClick={handleAddCoins} className="rounded bg-amber-500/20 border border-amber-400/40 px-2 py-0.5 hover:bg-amber-500/30">+100 Coins</button>
        <button onClick={handleTestLevelUp} className="rounded bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 hover:bg-emerald-500/30">Test Level-Up</button>
      </div>
    </div>
  );
}
