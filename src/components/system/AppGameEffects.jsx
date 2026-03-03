// src/components/AppGameEffects.jsx

import * as React from "react";
import { useSelector } from "react-redux";
import { selectDogPolls, selectDogSkillTree } from "@/redux/dogSlice.js";
import { selectSettings } from "@/redux/settingsSlice.js";

/**
 * Writes tiny app-wide data-attributes used for dynamic CSS.
 *
 * Kept separate from AppPreferencesEffects so gameplay visuals stay independent
 * from user preferences.
 */
export default function AppGameEffects() {
  const skillTree = useSelector(selectDogSkillTree);
  const polls = useSelector(selectDogPolls);
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

    // Branch accent (used by global CSS variables; safe to omit when unset).
    if (showBranchAccent && lastBranchId) {
      root.dataset.skillBranch = String(lastBranchId);
    } else {
      delete root.dataset.skillBranch;
    }

    // Micro-story / poll moment active.
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
