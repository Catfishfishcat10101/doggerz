// src/store/workflowSlice.js

import { createSlice } from "@reduxjs/toolkit";

export const WORKFLOW_STATUS = Object.freeze({
  IDLE: "idle",
  ACTIVE: "active",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
});

const initialState = {
  byId: {},
};

function clampStep(value, min = 0, max = Number.POSITIVE_INFINITY) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function ensureWorkflow(state, id) {
  if (!id) return null;
  if (!state.byId[id]) {
    state.byId[id] = {
      id,
      status: WORKFLOW_STATUS.IDLE,
      stepIndex: 0,
      data: {},
      startedAt: null,
      updatedAt: null,
    };
  }
  return state.byId[id];
}

function getWorkflow(state, id) {
  if (!id) return null;
  return state.byId[id] || null;
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

      wf.status = WORKFLOW_STATUS.ACTIVE;
      wf.stepIndex = clampStep(action.payload?.stepIndex, 0);
      wf.data = {
        ...(existing?.data || {}),
        ...(isPlainObject(action.payload?.initialData)
          ? action.payload.initialData
          : {}),
      };
      wf.startedAt = existing?.startedAt ?? now;
      wf.updatedAt = now;
    },

    setWorkflowData(state, action) {
      const id = String(action.payload?.id || "").trim();
      const patch = action.payload?.patch;

      if (!id || !isPlainObject(patch)) return;

      const wf = getWorkflow(state, id);
      if (!wf) return;

      wf.data = { ...(wf.data || {}), ...patch };
      wf.updatedAt = Date.now();
    },

    nextStep(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;

      const wf = getWorkflow(state, id);
      if (!wf) return;

      const maxSteps = clampStep(action.payload?.maxSteps, 1);
      const lastIndex = Math.max(0, maxSteps - 1);

      wf.stepIndex = clampStep((wf.stepIndex || 0) + 1, 0, lastIndex);
      wf.status = WORKFLOW_STATUS.ACTIVE;
      wf.updatedAt = Date.now();
    },

    prevStep(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;

      const wf = getWorkflow(state, id);
      if (!wf) return;

      wf.stepIndex = clampStep((wf.stepIndex || 0) - 1, 0);
      wf.status = WORKFLOW_STATUS.ACTIVE;
      wf.updatedAt = Date.now();
    },

    goToStep(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;

      const wf = getWorkflow(state, id);
      if (!wf) return;

      const maxSteps = Number.isFinite(Number(action.payload?.maxSteps))
        ? clampStep(action.payload.maxSteps, 1)
        : Number.POSITIVE_INFINITY;

      const lastIndex =
        maxSteps === Number.POSITIVE_INFINITY
          ? Number.POSITIVE_INFINITY
          : Math.max(0, maxSteps - 1);

      wf.stepIndex = clampStep(action.payload?.stepIndex, 0, lastIndex);
      wf.status = WORKFLOW_STATUS.ACTIVE;
      wf.updatedAt = Date.now();
    },

    cancelWorkflow(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;

      const wf = getWorkflow(state, id);
      if (!wf) return;

      wf.status = WORKFLOW_STATUS.CANCELLED;
      wf.updatedAt = Date.now();
    },

    completeWorkflow(state, action) {
      const id = String(action.payload?.id || "").trim();
      if (!id) return;

      const wf = getWorkflow(state, id);
      if (!wf) return;

      wf.status = WORKFLOW_STATUS.COMPLETED;
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
  completeWorkflow,
  resetWorkflow,
  resetAllWorkflows,
} = workflowSlice.actions;

export const selectWorkflows = (state) => state.workflows?.byId || {};
export const selectWorkflowById = (id) => (state) =>
  state.workflows?.byId?.[String(id || "").trim()] || null;

export default workflowSlice.reducer;
