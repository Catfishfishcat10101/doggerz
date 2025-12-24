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

export default function WorkflowEngine() {
  const dispatch = useDispatch();
  const workflows = useSelector(selectWorkflows);

  const hasHydratedRef = useRef(false);
  const saveTimeoutRef = useRef(null);

  // Hydrate once.
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;

    try {
      const raw = localStorage.getItem(WORKFLOW_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      dispatch(hydrateWorkflows(parsed));
    } catch {
      // ignore bad payloads
    }
  }, [dispatch]);

  // Persist on change (debounced).
  useEffect(() => {
    try {
      if (!workflows) return;
      if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);

      saveTimeoutRef.current = window.setTimeout(() => {
        try {
          localStorage.setItem(WORKFLOW_STORAGE_KEY, JSON.stringify(workflows));
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
