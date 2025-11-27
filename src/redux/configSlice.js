// src/redux/configSlice.js
// Loads dynamic configs (polls, training, badges, events) from public JSON files
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const fetchConfig = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return await res.json();
};

export const loadPolls = createAsyncThunk(
  "config/loadPolls",
  async () => await fetchConfig("/polls.json"),
);
export const loadTraining = createAsyncThunk(
  "config/loadTraining",
  async () => await fetchConfig("/training.json"),
);
export const loadBadges = createAsyncThunk(
  "config/loadBadges",
  async () => await fetchConfig("/badges.json"),
);
export const loadEvents = createAsyncThunk(
  "config/loadEvents",
  async () => await fetchConfig("/events.json"),
);

const initialState = {
  polls: [],
  training: [],
  badges: [],
  events: [],
  loading: false,
  error: null,
};

const configSlice = createSlice({
  name: "config",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadPolls.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadPolls.fulfilled, (state, { payload }) => {
        state.polls = payload;
        state.loading = false;
      })
      .addCase(loadPolls.rejected, (state, { error }) => {
        state.error = error.message;
        state.loading = false;
      })
      .addCase(loadTraining.fulfilled, (state, { payload }) => {
        state.training = payload;
      })
      .addCase(loadBadges.fulfilled, (state, { payload }) => {
        state.badges = payload;
      })
      .addCase(loadEvents.fulfilled, (state, { payload }) => {
        state.events = payload;
      });
  },
});

export default configSlice.reducer;
