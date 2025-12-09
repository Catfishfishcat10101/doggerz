// src/store/weatherSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchWeatherByZip } from "@/lib/weatherApi.js";

export const loadWeather = createAsyncThunk(
  "weather/loadWeather",
  async (zip) => {
    const data = await fetchWeatherByZip(zip);
    return data;
  },
);

const weatherSlice = createSlice({
  name: "weather",
  initialState: {
    zip: null,
    condition: "clear",
    temperature: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    setZip(state, action) {
      state.zip = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadWeather.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadWeather.fulfilled, (state, action) => {
        state.isLoading = false;
        state.condition = action.payload.condition;
        state.temperature = action.payload.temperature;
      })
      .addCase(loadWeather.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to load weather";
      });
  },
});

export const { setZip } = weatherSlice.actions;
export default weatherSlice.reducer;
