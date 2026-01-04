/** @format */

// src/hooks/useTrainingMaintenance.js
import * as React from "react";
import { useDispatch } from "react-redux";
import { applySkillRust } from "@/redux/trainingTreeSlice.js";

/**
 * Applies rust quietly. Default: every 15 minutes + on tab focus.
 */
export function useTrainingMaintenance({ intervalMs = 15 * 60 * 1000 } = {}) {
  const dispatch = useDispatch();

  React.useEffect(() => {
    dispatch(applySkillRust({ now: Date.now() }));

    const t = setInterval(() => {
      dispatch(applySkillRust({ now: Date.now() }));
    }, intervalMs);

    const onVis = () => {
      if (document.visibilityState === "visible") {
        dispatch(applySkillRust({ now: Date.now() }));
      }
    };

    window.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(t);
      window.removeEventListener("visibilitychange", onVis);
    };
  }, [dispatch, intervalMs]);
}
