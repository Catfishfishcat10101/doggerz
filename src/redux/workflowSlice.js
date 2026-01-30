/** @format */

// src/redux/workflowSlice.js

import { createSlice } from "@reduxjs/toolkit";

export const WORKFLOW_STORAGE_KEY = "doggerz:workflows";

const nowMs = () => Date.now();

function normalizeWorkflowState(raw) {
  if (!raw || typeof raw !== "object") return null;
  const status = String(raw.status || "idle").toLowerCase();
  const allowed = ["idle", "active", "completed", "cancelled"];
  return {
    id: String(raw.id || ""),
    status: allowed.includes(status) ? status : "idle",
    stepIndex: Math.max(0, Number(raw.stepIndex) || 0),
    data: raw.data && typeof raw.data === "object" ? { ...raw.data } : {},
    startedAt: Number(raw.startedAt || 0) || null,
    updatedAt: Number(raw.updatedAt || 0) || null,
    completedAt: Number(raw.completedAt || 0) || null,
    cancelledAt: Number(raw.cancelledAt || 0) || null,
    version: Number(raw.version || 1) || 1,
  };
}

const initialState = {
  // Map of workflowId -> workflow state
  byId: {},
};

function ensureWorkflow(state, workflowId) {
  const id = String(workflowId || "").trim();
  if (!id) return null;

  if (!state.byId[id]) {
    state.byId[id] = {
      id,
      status: "idle", // idle | active | completed | cancelled
      stepIndex: 0,
      // arbitrary payload the wizard collects
      data: {},
      startedAt: null,
      updatedAt: null,
      completedAt: null,
      cancelledAt: null,
      version: 1,
    };
  }

  return state.byId[id];
}

const workflowSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    hydrateWorkflows(state, { payload }) {
      if (!payload || typeof payload !== "object") return;
      const byId = payload.byId;
      if (!byId || typeof byId !== "object") return;

      // Merge in a conservative way so a bad payload can't brick the app
      for (const [id, wf] of Object.entries(byId)) {
        const safeId = String(id);
        const normalized = normalizeWorkflowState({ ...wf, id: safeId });
        if (!normalized) continue;
        state.byId[safeId] = {
          ...ensureWorkflow(state, safeId),
          ...normalized,
          id: safeId,
        };
      }
    },

    startWorkflow(state, { payload }) {
      const { id, initialData, stepIndex = 0 } = payload || {};
      const wf = ensureWorkflow(state, id);
      if (!wf) return;

      wf.status = "active";
      wf.stepIndex = Math.max(0, Number(stepIndex) || 0);
      wf.data = { ...(wf.data || {}), ...(initialData || {}) };
      const now = nowMs();
      wf.startedAt = wf.startedAt || now;
      wf.updatedAt = now;
      wf.completedAt = null;
      wf.cancelledAt = null;
    },

    setWorkflowData(state, { payload }) {
      const { id, patch } = payload || {};
      const wf = ensureWorkflow(state, id);
      if (!wf) return;

      wf.data = { ...(wf.data || {}), ...(patch || {}) };
      wf.updatedAt = nowMs();
    },

    goToStep(state, { payload }) {
      const { id, stepIndex } = payload || {};
      const wf = ensureWorkflow(state, id);
      if (!wf) return;

      wf.stepIndex = Math.max(0, Number(stepIndex) || 0);
      wf.updatedAt = nowMs();
      if (wf.status !== "active") wf.status = "active";
    },

    nextStep(state, { payload }) {
      const { id, maxSteps } = payload || {};
      const wf = ensureWorkflow(state, id);
      if (!wf) return;

      const next = wf.stepIndex + 1;
      const capped = Number.isFinite(maxSteps)
        ? Math.min(next, maxSteps - 1)
        : next;
      wf.stepIndex = Math.max(0, capped);
      wf.updatedAt = nowMs();
      if (wf.status !== "active") wf.status = "active";
    },

    prevStep(state, { payload }) {
      const { id } = payload || {};
      const wf = ensureWorkflow(state, id);
      if (!wf) return;

      wf.stepIndex = Math.max(0, wf.stepIndex - 1);
      wf.updatedAt = nowMs();
      if (wf.status !== "active") wf.status = "active";
    },

    completeWorkflow(state, { payload }) {
      const { id } = payload || {};
      const wf = ensureWorkflow(state, id);
      if (!wf) return;

      wf.status = "completed";
      wf.completedAt = nowMs();
      wf.updatedAt = nowMs();
    },

    cancelWorkflow(state, { payload }) {
      const { id } = payload || {};
      const wf = ensureWorkflow(state, id);
      if (!wf) return;

      wf.status = "cancelled";
      wf.cancelledAt = nowMs();
      wf.updatedAt = nowMs();
    },

    resetWorkflow(state, { payload }) {
      const { id } = payload || {};
      const safeId = String(id || "").trim();
      if (!safeId) return;
      delete state.byId[safeId];
    },
  },
});

/* selectors */

export const selectWorkflows = (state) => state.workflows;
export const selectWorkflowById = (id) => (state) =>
  state.workflows?.byId?.[id];

export const {
  hydrateWorkflows,
  startWorkflow,
  setWorkflowData,
  goToStep,
  nextStep,
  prevStep,
  completeWorkflow,
  cancelWorkflow,
  resetWorkflow,
} = workflowSlice.actions;

export default workflowSlice.reducer;
