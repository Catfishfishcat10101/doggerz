// src/components/system/AppGameEffects.jsx

import * as React from "react";
import { useSelector } from "react-redux";
import { useDogAppEffectsState } from "@/hooks/useDogState.js";
import { selectSettings } from "@/store/settingsSlice.js";

export default function AppGameEffects() {
  const { skillTree, polls } = useDogAppEffectsState();
  const settings = useSelector(selectSettings);

  const lastUnlockedAt =
    typeof skillTree?.lastUnlockedAt === "number"
      ? skillTree.lastUnlockedAt
      : 0;
  const lastBranchId = skillTree?.lastBranchId || "";
  const storyActive = Boolean(polls?.active);
  const storyExpiresAt =
    typeof polls?.active?.expiresAt === "number"
      ? polls.active.expiresAt
      : null;

  const showSkillPulse = settings?.gameFxSkillPulse !== false;
  const showStoryGlow = settings?.gameFxStoryGlow !== false;
  const showBranchAccent = settings?.gameFxBranchAccent !== false;

  React.useEffect(() => {
    const root = document.documentElement;
    if (showBranchAccent && lastBranchId) {
      root.dataset.skillBranch = String(lastBranchId);
    } else {
      delete root.dataset.skillBranch;
    }

    if (showStoryGlow && storyActive) root.dataset.storyActive = "1";
    else delete root.dataset.storyActive;

    if (showStoryGlow && storyActive && storyExpiresAt) {
      const remaining = Math.max(0, storyExpiresAt - Date.now());
      const urgency =
        remaining <= 10_000 ? "high" : remaining <= 30_000 ? "medium" : "low";
      root.dataset.storyUrgency = urgency;
    } else {
      delete root.dataset.storyUrgency;
    }
  }, [
    lastBranchId,
    storyActive,
    storyExpiresAt,
    showBranchAccent,
    showStoryGlow,
  ]);

  React.useEffect(() => {
    if (!showSkillPulse || !lastUnlockedAt) return;

    const root = document.documentElement;
    root.dataset.skillPulse = "1";

    const t = window.setTimeout(() => {
      // Only clear if nothing else re-triggered it.
      try {
        delete root.dataset.skillPulse;
      } catch (e) {
        void e;
      }
    }, 650);

    return () => window.clearTimeout(t);
  }, [lastUnlockedAt, showSkillPulse]);

  React.useEffect(() => {
    if (showSkillPulse) return;
    const root = document.documentElement;
    delete root.dataset.skillPulse;
  }, [showSkillPulse]);

  return null;
}
