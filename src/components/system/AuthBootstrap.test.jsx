import { configureStore } from "@reduxjs/toolkit";
import { render, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AuthBootstrap from "./AuthBootstrap.jsx";
import userReducer from "@/store/userSlice.js";

const { onAuthStateChangedMock, signOutMock } = vi.hoisted(() => ({
  onAuthStateChangedMock: vi.fn(),
  signOutMock: vi.fn(),
}));

vi.mock("@/lib/firebase/index.js", () => ({
  auth: { app: "mock-auth" },
  firebaseReady: true,
}));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args) => onAuthStateChangedMock(...args),
  signOut: (...args) => signOutMock(...args),
}));

function renderWithStore() {
  const store = configureStore({
    reducer: {
      user: userReducer,
    },
  });
  render(
    <Provider store={store}>
      <AuthBootstrap />
    </Provider>
  );
  return store;
}

describe("AuthBootstrap", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    onAuthStateChangedMock.mockReset();
    signOutMock.mockReset();
  });

  it("resolves signed-in users without production console info", async () => {
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback({
        uid: "user-1",
        isAnonymous: false,
        displayName: "Trainer",
        email: "trainer@example.com",
        photoURL: "avatar.png",
        metadata: { creationTime: "2026-01-01T00:00:00.000Z" },
        getIdToken: vi.fn().mockResolvedValue("token"),
      });
      return vi.fn();
    });

    const store = renderWithStore();

    await waitFor(() => {
      expect(store.getState().user.id).toBe("user-1");
    });
    expect(store.getState().user.authResolved).toBe(true);
    expect(console.info).not.toHaveBeenCalled();
  });

  it("signs out anonymous Firebase sessions and falls back to local auth state", async () => {
    signOutMock.mockResolvedValue(undefined);
    onAuthStateChangedMock.mockImplementation((_auth, callback) => {
      callback({
        uid: "anon-1",
        isAnonymous: true,
      });
      return vi.fn();
    });

    const store = renderWithStore();

    await waitFor(() => {
      expect(signOutMock).toHaveBeenCalled();
      expect(store.getState().user.authResolved).toBe(true);
    });
    expect(store.getState().user.id).toBeNull();
  });
});
