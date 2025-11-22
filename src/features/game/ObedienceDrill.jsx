// src/features/game/ObedienceDrill.jsx
// @ts-nocheck

import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectDogSkills, trainObedience } from "@/redux/dogSlice.js";
import { SKILL_LEVEL_STEP } from "@/constants/game.js";
import VoiceCommandButton from "../../components/VoiceCommandButton.jsx";

function SkillRow({ label, node }) {
  if (!node) return null;

  const xp = Number.isFinite(node.xp) ? node.xp : 0;
  const level = Number.isFinite(node.level) ? node.level : 1;
  const pct = Math.max(0, Math.min(100, (xp / SKILL_LEVEL_STEP) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-zinc-400">
        <span>{label}</span>
        <span>
          L{level} • {xp} XP
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-emerald-500 transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function ObedienceDrill() {
  const dispatch = useDispatch();
  const skills = useSelector(selectDogSkills) || {};
  const obedience = skills.obedience || {};

  const hasAnySkill =
    obedience.sit || obedience.stay || obedience.rollOver || obedience.speak;

  // Choose a target command to practice: prefer the one with lowest progress
  const targetCommand = useMemo(() => {
    const candidates = [
      { id: "sit", node: obedience.sit },
      { id: "stay", node: obedience.stay },
      { id: "rollOver", node: obedience.rollOver },
      { id: "speak", node: obedience.speak },
    ].filter((c) => c.node);

    if (candidates.length === 0) return "sit"; // default

    const withPct = candidates.map((c) => {
      const xp = Number.isFinite(c.node?.xp) ? c.node.xp : 0;
      const pct = Math.max(0, Math.min(100, (xp / SKILL_LEVEL_STEP) * 100));
      return { id: c.id, pct };
    });

    withPct.sort((a, b) => a.pct - b.pct);
    return withPct[0].id;
  }, [obedience]);

  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'fail', text: string }

  const handleCommand = ({ transcript, commandId, match }) => {
    if (match && commandId) {
      // Grant XP toward the matched command
      dispatch(
        trainObedience({
          commandId,
          success: true,
        }),
      );
      setFeedback({ type: "success", text: `Nice! Recognized "${commandId}"` });
    } else if (transcript) {
      setFeedback({
        type: "fail",
        text: `Heard “${transcript}”. Try saying "${targetCommand}".`,
      });
    } else {
      setFeedback({
        type: "fail",
        text: `Didn’t catch that. Try "${targetCommand}".`,
      });
    }

    // Auto-hide after 2.2s
    window.clearTimeout(handleCommand._t);
    handleCommand._t = window.setTimeout(() => setFeedback(null), 2200);
  };

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-50">
            Obedience Training
          </h2>
          <p className="text-xs text-zinc-400">
            Press, give a command, and level up your pup&apos;s obedience skill
            tree.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {hasAnySkill ? (
          <>
            {obedience.sit && <SkillRow label="Sit" node={obedience.sit} />}
            {obedience.stay && <SkillRow label="Stay" node={obedience.stay} />}
            {obedience.rollOver && (
              <SkillRow label="Roll Over" node={obedience.rollOver} />
            )}
            {obedience.speak && (
              <SkillRow label="Speak" node={obedience.speak} />
            )}
          </>
        ) : (
          <p className="text-xs text-zinc-500">
            No commands trained yet. Use voice commands to start building
            skills.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-zinc-500">
            Target
          </span>
          <span className="text-xs font-semibold text-emerald-400">
            {targetCommand}
          </span>
        </div>

        <VoiceCommandButton
          mode="tap"
          expectedCommand={targetCommand}
          onCommand={handleCommand}
        />

        {feedback && (
          <div
            className={`text-xs rounded-lg px-3 py-2 border ${
              feedback.type === "success"
                ? "border-emerald-500/50 text-emerald-300 bg-emerald-500/10"
                : "border-red-500/40 text-red-300 bg-red-500/10"
            }`}
          >
            {feedback.text}
          </div>
        )}
      </div>
    </section>
  );
}
