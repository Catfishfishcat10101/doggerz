// src/components/AppGameEffects.jsx

import * as React from "react";
import { useSelector } from "react-redux";
import { selectDogPolls, selectDogSkillTree } from "@/redux/dogSlice.js";

/**
 * Writes tiny app-wide data-attributes used for dynamic CSS.
 *
 * Kept separate from AppPreferencesEffects so gameplay visuals stay independent
 * from user preferences.
 */
export default function AppGameEffects() {
  const skillTree = useSelector(selectDogSkillTree);
  const polls = useSelector(selectDogPolls);

  const lastUnlockedAt =
    typeof skillTree?.lastUnlockedAt === "number"
      ? skillTree.lastUnlockedAt
      : 0;
  const lastBranchId = skillTree?.lastBranchId || "";
  const storyActive = Boolean(polls?.active);

  React.useEffect(() => {
    const root = document.documentElement;

    // Branch accent (used by global CSS variables; safe to omit when unset).
    if (lastBranchId) root.dataset.skillBranch = String(lastBranchId);
    else delete root.dataset.skillBranch;

    // Micro-story / poll moment active.
    if (storyActive) root.dataset.storyActive = "1";
    else delete root.dataset.storyActive;
  }, [lastBranchId, storyActive]);

  React.useEffect(() => {
    if (!lastUnlockedAt) return;

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
  }, [lastUnlockedAt]);

  return null;
}
