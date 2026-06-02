import { configureStore } from "@reduxjs/toolkit";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";

import ProtectedRoute from "./ProtectedRoute.jsx";
import dogReducer from "@/store/dogSlice.js";
import userReducer from "@/store/userSlice.js";

function renderRoute({ user, dog }) {
  const store = configureStore({
    reducer: {
      dog: dogReducer,
      user: userReducer,
    },
    preloadedState: {
      user,
      dog,
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/memories"]}>
        <Routes>
          <Route
            path="/memories"
            element={
              <ProtectedRoute>
                <div>Protected memories</div>
              </ProtectedRoute>
            }
          />
          <Route path="/adopt" element={<div>Adopt page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("ProtectedRoute", () => {
  it("shows a loading state while auth/local save state is unresolved", () => {
    renderRoute({
      user: { authResolved: false },
      dog: { adoptedAt: 100 },
    });

    expect(screen.getByText(/Doggerz is checking/i)).toBeInTheDocument();
  });

  it("redirects protected pages until a dog has been adopted", () => {
    renderRoute({
      user: { authResolved: true },
      dog: { adoptedAt: null },
    });

    expect(screen.getByText("Adopt page")).toBeInTheDocument();
  });

  it("renders protected content after adoption", () => {
    renderRoute({
      user: { authResolved: true },
      dog: { adoptedAt: 100 },
    });

    expect(screen.getByText("Protected memories")).toBeInTheDocument();
  });
});
