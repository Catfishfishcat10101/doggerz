import { configureStore } from "@reduxjs/toolkit";
import { beforeEach, describe, expect, it, vi } from "vitest";

import dogReducer from "@/store/dogSlice.js";
import { loadDogFromCloud } from "@/store/dogThunks.js";
import userReducer from "@/store/userSlice.js";
import progressionReducer from "@/features/progression/progressionSlice.js";

const { getDocMock, setDocMock, ensureAnonSignInMock } = vi.hoisted(() => ({
  getDocMock: vi.fn(),
  setDocMock: vi.fn(),
  ensureAnonSignInMock: vi.fn(),
}));

vi.mock("firebase/firestore", () => ({
  deleteDoc: vi.fn(),
  getDoc: (...args) => getDocMock(...args),
  serverTimestamp: () => ({ __serverTimestamp: true }),
  setDoc: (...args) => setDocMock(...args),
}));

vi.mock("@/lib/firebase/index.js", () => ({
  auth: { currentUser: { uid: "user-1", isAnonymous: false } },
  db: { app: "mock-db" },
}));

vi.mock("@/lib/firebase/paths.js", () => ({
  dogMainDoc: (uid) => ({ path: `users/${uid}/dog/main` }),
}));

vi.mock("@/lib/firebaseClient.js", () => ({
  ensureAnonSignIn: () => ensureAnonSignInMock(),
  isAnonymousFirebaseUser: (user) => Boolean(user?.isAnonymous),
  isFirestorePermissionError: () => false,
}));

function makeStore(dog) {
  return configureStore({
    reducer: {
      dog: dogReducer,
      progression: progressionReducer,
      user: userReducer,
    },
    preloadedState: {
      dog,
      progression: { updatedAt: 0, events: [] },
      user: {
        authResolved: true,
        id: "user-1",
        cloudSync: { status: "local" },
      },
    },
  });
}

describe("cloud dog merge policy", () => {
  beforeEach(() => {
    getDocMock.mockReset();
    setDocMock.mockReset();
    ensureAnonSignInMock.mockResolvedValue({
      uid: "user-1",
      isAnonymous: false,
    });
  });

  it("hydrates when the versioned cloud snapshot is newer", async () => {
    const store = makeStore({
      adoptedAt: 100,
      name: "Local",
      lastUpdatedAt: 1_000,
    });
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({
        schemaVersion: 2,
        dog: {
          adoptedAt: 100,
          name: "Cloud Fireball",
          lastUpdatedAt: 5_000,
        },
        progression: { updatedAt: 5_100, events: [] },
        summary: {},
        meta: { savedAt: 5_200 },
      }),
    });

    const result = await store.dispatch(loadDogFromCloud()).unwrap();

    expect(result.hydrated).toBe(true);
    expect(store.getState().dog.name).toBe("Cloud Fireball");
    expect(setDocMock).not.toHaveBeenCalled();
  });

  it("uploads the local snapshot when local state is newer", async () => {
    const store = makeStore({
      adoptedAt: 100,
      name: "Local Fireball",
      lastUpdatedAt: 8_000,
      stats: { hunger: 20 },
    });
    getDocMock.mockResolvedValue({
      exists: () => true,
      data: () => ({
        schemaVersion: 2,
        dog: {
          adoptedAt: 100,
          name: "Old Cloud",
          lastUpdatedAt: 1_000,
        },
        summary: {},
        meta: { savedAt: 1_100 },
      }),
    });

    const result = await store.dispatch(loadDogFromCloud()).unwrap();

    expect(result.reason).toBe("local_is_newer");
    expect(setDocMock).toHaveBeenCalledTimes(1);
    expect(setDocMock.mock.calls[0][1]).toMatchObject({
      schemaVersion: 2,
      dog: {
        name: "Local Fireball",
      },
    });
  });
});
