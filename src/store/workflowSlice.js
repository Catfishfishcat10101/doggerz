// src/redux/workflowSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  byId: {},
};

function clampStep(value, min = 0, max = Number.POSITIVE_INFINITY) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function ensureWorkflow(state, id) {
  if (!id) return null;
  if (!state.byId[id]) {
    state.byId[id] = {
      id,
      status: "idle",
      stepIndex: 0,
      data: {},
      startedAt: null,
      updatedAt: null,
    };
  }
  return state.byId[id];
}

const workflowSlice = createSlice({
  name: "workflows",
  initialState,
  reducers: {
    startWorkflow(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;
      const now = Date.now();
      const existing = state.byId[id];
      const wf = ensureWorkflow(state, id);
      if (!wf) return;

      wf.status = "active";
      wf.stepIndex = clampStep(action.payload?.stepIndex, 0);
      wf.data = {
        ...(existing?.data || {}),
        ...((action.payload?.initialData || {}) &&
        typeof action.payload?.initialData === "object"
          ? action.payload.initialData
          : {}),
      };
      wf.startedAt = existing?.startedAt ?? now;
      wf.updatedAt = now;
    },
    setWorkflowData(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;
      const patch = action.payload?.patch;
      if (!patch || typeof patch !== "object") return;
      const wf = ensureWorkflow(state, id);
      if (!wf) return;
      wf.data = { ...(wf.data || {}), ...patch };
      wf.updatedAt = Date.now();
    },
    nextStep(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;
      const wf = ensureWorkflow(state, id);
      if (!wf) return;
      const maxSteps = clampStep(action.payload?.maxSteps, 1);
      const lastIndex = Math.max(0, maxSteps - 1);
      wf.stepIndex = clampStep((wf.stepIndex || 0) + 1, 0, lastIndex);
      wf.status = "active";
      wf.updatedAt = Date.now();
    },
    prevStep(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;
      const wf = ensureWorkflow(state, id);
      if (!wf) return;
      wf.stepIndex = clampStep((wf.stepIndex || 0) - 1, 0);
      wf.updatedAt = Date.now();
    },
    goToStep(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;
      const wf = ensureWorkflow(state, id);
      if (!wf) return;
      wf.stepIndex = clampStep(action.payload?.stepIndex, 0);
      wf.updatedAt = Date.now();
    },
    cancelWorkflow(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;
      const wf = ensureWorkflow(state, id);
      if (!wf) return;
      wf.status = "cancelled";
      wf.updatedAt = Date.now();
    },
    resetWorkflow(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;
      delete state.byId[id];
    },
    resetAllWorkflows(state) {
      state.byId = {};
    },
  },
});

export const {
  startWorkflow,
  setWorkflowData,
  nextStep,
  prevStep,
  goToStep,
  cancelWorkflow,
  resetWorkflow,
  resetAllWorkflows,
} = workflowSlice.actions;

export const selectWorkflows = (state) => state.workflows?.byId || {};
export const selectWorkflowById = (id) => (state) =>
  state.workflows?.byId?.[id] || null;

export default workflowSlice.reducer;
