// src/features/workflow/WorkflowEngine.jsx
// Headless persistence + hydration for multi-step workflows.

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  WORKFLOW_STORAGE_KEY,
  hydrateWorkflows,
  selectWorkflows,
} from "@/redux/workflowSlice.js";

const LOCAL_SAVE_DEBOUNCE = 200;

function getBrowserStorage() {
  try {
    if (typeof window === "undefined") return null;
    // Accessing localStorage can throw in some browser/privacy modes.
    const storage = window.localStorage;
    if (!storage) return null;
    return storage;
  } catch {
    return null;
  }
}

export default function WorkflowEngine() {
  const dispatch = useDispatch();
  const workflows = useSelector(selectWorkflows);

  const hasHydratedRef = useRef(false);
  const hydrationPhaseRef = useRef("pending"); // pending | hydrating | done
  const hydrationBaselineRef = useRef(null);
  const skipNextSaveRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Hydrate once.
  useEffect(() => {
    const storage = getBrowserStorage();
    if (!storage) return;
    if (hasHydratedRef.current) return;

    hasHydratedRef.current = true;

    try {
      const raw = storage.getItem(WORKFLOW_STORAGE_KEY);
      if (!raw) {
        hydrationPhaseRef.current = "done";
        return;
      }

      const parsed = JSON.parse(raw);
      // Prevent the immediate persist right after hydration.
      hydrationPhaseRef.current = "hydrating";
      hydrationBaselineRef.current = workflows;
      skipNextSaveRef.current = true;
      dispatch(hydrateWorkflows(parsed));
    } catch {
      // ignore bad payloads
      hydrationPhaseRef.current = "done";
    }
  }, [dispatch, workflows]);

  // Persist on change (debounced).
  useEffect(() => {
    const storage = getBrowserStorage();
    if (!storage) return;

    try {
      if (!workflows) return;

      // If hydration dispatched, wait for the post-hydration state before persisting,
      // and then skip that first persist once.
      if (hydrationPhaseRef.current === "hydrating") {
        if (workflows === hydrationBaselineRef.current) return;
        hydrationPhaseRef.current = "done";
        hydrationBaselineRef.current = null;
      } else if (hydrationPhaseRef.current === "pending") {
        hydrationPhaseRef.current = "done";
      }

      // Skip one save right after hydration dispatch.
      if (skipNextSaveRef.current) {
        skipNextSaveRef.current = false;
        return;
      }

      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = window.setTimeout(() => {
        try {
          storage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflows));
        } catch {
          // ignore quota errors
        }
        saveTimeoutRef.current = null;
      }, LOCAL_SAVE_DEBOUNCE);
    } catch {
      // ignore
    }

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, [workflows]);

  return null;
}
