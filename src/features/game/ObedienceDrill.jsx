// src/features/game/ObedienceDrill.jsx
import React from "react";
import { useSelector } from "react-redux";
import { selectDogSkills } from "@/redux/dogSlice.js";
import VoiceCommandButton from "./VoiceCommandButton.jsx";

function SkillRow({ label, node }) {
  const pct = Math.min(100, (node.xp / 50) * 100); // SKILL_LEVEL_STEP mirror
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>
          L{node.level} • {node.xp} XP
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-emerald-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ObedienceDrill() {
  const skills = useSelector(selectDogSkills);
  const obedience = skills.obedience || {};

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-50">
            Obedience Training
          </h2>
          <p className="text-xs text-zinc-400">
            Press, give a command, and level up your pup&apos;s obedience skill tree.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {obedience.sit && <SkillRow label="Sit" node={obedience.sit} />}
        {obedience.stay && <SkillRow label="Stay" node={obedience.stay} />}
        {obedience.rollOver && (
          <SkillRow label="Roll Over" node={obedience.rollOver} />
        )}
        {obedience.speak && (
          <SkillRow label="Speak" node={obedience.speak} />
        )}
      </div>

      <VoiceCommandButton />
    </section>
  );
}
