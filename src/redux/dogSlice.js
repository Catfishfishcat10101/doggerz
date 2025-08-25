import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  name: "Buddy",
  poops: [],
};

const dogSlice = createSlice({
  name: "dog",
  initialState,
  reducers: {
    setName(state, action) {
      state.name = action.payload;
    },
    addPoop(state) {
      state.poops.push({ id: nanoid(), ts: Date.now() });
    },
    clearPoops(state) {
      state.poops = [];
    },
  },
});

export const { setName, addPoop, clearPoops } = dogSlice.actions;
export default dogSlice.reducer;
