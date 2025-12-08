import React from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/hooks.js";
import {
  selectDogTraining,
  selectDogSkills,
  trainObedience,
} from "@/redux/dogSlice.js";
import { SKILL_LEVEL_STEP } from "@/config/training.js";

export default function TrainingPanel() {
  const dispatch = useAppDispatch();
  const training = useSelector(selectDogTraining) || {};
  const skills = useSelector(selectDogSkills) || {};
  const obedience = skills.obedience || {};
  const potty = training.potty || {};
  const unlockedAt = training.nonPottyUnlockedAt;
  const unlocked = unlockedAt
    ? Date.now() >= new Date(unlockedAt).getTime()
    : false;

  const handleTrainObedience = (commandId) => {
    if (!unlocked) return;
    // give moderate XP for practice — reducer applies decay and XP
    dispatch(trainObedience({ commandId, success: true, xp: 12 }));
  };

  return (
    <div className="p-4">
      <h3 className="text-sm font-semibold text-emerald-200 mb-2">Training</h3>

      <div className="mb-4 bg-zinc-900/40 border border-emerald-500/30 rounded-xl p-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-zinc-300">Potty Progress</div>
            <div className="text-sm font-medium text-emerald-100">
              {Math.round(potty.progress || 0)}%
            </div>
          </div>
          <div className="w-40">
            <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400"
                style={{
                  width: `${Math.max(0, Math.min(100, potty.progress || 0))}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <div
          className={`rounded-2xl p-4 border ${unlocked ? "border-emerald-500/40 bg-zinc-900/60 shadow-xl" : "border-zinc-800 bg-black/40"}`}
        >
          <div className="mb-3">
            <div className="text-sm font-semibold text-emerald-100">
              Obedience
            </div>
            <div className="text-xs text-zinc-300">
              Basic commands, focus, and recall.
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {Object.keys(obedience).length === 0 && (
              <div className="text-xs text-zinc-400">
                No obedience skills configured.
              </div>
            )}

            {Object.entries(obedience).map(([cmdId, state]) => {
              const lvl = state?.level ?? 0;
              const xp = state?.xp ?? 0;
              const next = SKILL_LEVEL_STEP;
              const pct = Math.max(
                0,
                Math.min(100, Math.round((xp / next) * 100)),
              );
              return (
                <div
                  key={cmdId}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-emerald-100 capitalize">
                        {cmdId}
                      </div>
                      <div className="text-xs text-zinc-300">Lv {lvl}</div>
                    </div>
                    <div className="mt-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-400"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[11px] text-zinc-400 mt-1">
                      {xp} / {next} XP
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => handleTrainObedience(cmdId)}
                      disabled={!unlocked}
                      className={`px-3 py-2 rounded-full text-sm font-semibold ml-3 ${unlocked ? "bg-emerald-500 text-zinc-900 shadow-md hover:scale-105 transform transition" : "bg-zinc-800 text-zinc-400 opacity-70"}`}
                    >
                      {unlocked ? "Practice" : "Locked"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {!unlocked && unlockedAt && (
            <div className="mt-3 text-[12px] text-zinc-400">
              Unlocks {new Date(unlockedAt).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
