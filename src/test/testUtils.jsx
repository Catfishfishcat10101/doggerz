import React from "react";
import { render } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import dogReducer from "@/redux/dogSlice.js";
import userReducer from "@/redux/userSlice.js";
import settingsReducer from "@/redux/settingsSlice.js";
import weatherReducer from "@/redux/weatherSlice.js";
import workflowsReducer from "@/redux/workflowSlice.js";
import trainingTreeReducer from "@/redux/trainingTreeSlice.js";

export function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: {
      dog: dogReducer,
      user: userReducer,
      settings: settingsReducer,
      weather: weatherReducer,
      workflows: workflowsReducer,
      trainingTree: trainingTreeReducer,
    },
    preloadedState,
  });
}

export function renderWithProviders(
  ui,
  { preloadedState = {}, store = makeStore(preloadedState), route = "/" } = {}
) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </Provider>
    ),
  };
}

