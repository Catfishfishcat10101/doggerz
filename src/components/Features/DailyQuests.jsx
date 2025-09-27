import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDailies, resetForNewDay, claim } from "@/redux/questSlice";
import { earn } from "@/redux/economySlice";

export default function DailyQuests() {
  const d = useDispatch();
  const dailies = useSelector(selectDailies);

  useEffect(() => { d(resetForNewDay()); }, [d]);

  const onClaim = (q) => {
    if (!q.done || q.rewardClaimed) return;
    d(earn(q.reward));
    d(claim(q.id));
  };

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
      <div className="font-semibold text-white/90">Daily Quests</div>
      {dailies.map((q) => (
        <div key={q.id} className="flex items-center justify-between gap-3">
          <div className="text-white/80">{q.label}</div>
          <div className="flex items-center gap-3">
            <div className="h-2 w-36 bg-white/10 rounded">
              <div className="h-2 bg-emerald-400 rounded" style={{ width: `${(q.progress/q.goal)*100}%` }} />
            </div>
            <button
              onClick={() => onClaim(q)}
              disabled={!q.done || q.rewardClaimed}
              className={`px-3 py-1 rounded text-sm ${q.done && !q.rewardClaimed ? "bg-emerald-600 text-white" : "bg-white/10 text-white/40"}`}
            >
              {q.rewardClaimed ? "Claimed" : q.done ? `Claim +${q.reward}` : `${q.progress}/${q.goal}`}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}