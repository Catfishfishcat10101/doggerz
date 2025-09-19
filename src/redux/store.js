// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import dog from "./dogSlice";
import user from "./userSlice";

/** ----------------------- Local persistence (fallback) -----------------------
 * This is a belt-and-suspenders cache so the app boots with something even if
 * Firestore is cold or the user is offline. It’s small, versioned, and easily
 * removable if you decide you don’t want any local state persisted.
 */
const PERSIST_KEY = "doggerz_store_v1";
const PERSIST_VERSION = 1;

/** Load persisted state (best-effort, null on failure) */
function loadPersistedState() {
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (!raw) return undefined;
    const { v, state } = JSON.parse(raw);
    if (v !== PERSIST_VERSION) return undefined;
    // Minimal schema sanity
    return {
      dog: state?.dog ?? undefined,
      user: state?.user ?? undefined,
    };
  } catch {
    return undefined;
  }
}

/** Save a *small* slice of state; don’t hoard everything. */
function savePersistedState(state) {
  try {
    const snapshot = {
      dog: {
        // whitelist only what you need for instant boot
        name: state.dog?.name,
        level: state.dog?.level,
        xp: state.dog?.xp,
        happiness: state.dog?.happiness,
        needs: state.dog?.needs,
        pos: state.dog?.pos,
        accessories: state.dog?.accessories,
      },
      user: {
        uid: state.user?.uid,
        displayName: state.user?.displayName,
        email: state.user?.email,
      },
    };
    localStorage.setItem(PERSIST_KEY, JSON.stringify({ v: PERSIST_VERSION, state: snapshot }));
  } catch {
    /* ignore quota errors */
  }
}

/** tiny throttle to avoid spamming storage */
function throttle(fn, ms = 1500) {
  let t = 0;
  return (...args) => {
    const now = Date.now();
    if (now - t >= ms) {
      t = now;
      fn(...args);
    }
  };
}

const preloadedState = loadPersistedState();

/** ----------------------- Store configuration ----------------------- */
const store = configureStore({
  reducer: { dog, user },
  preloadedState,
  devTools: import.meta.env.DEV, // enabled in dev only
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Firestore timestamps, File objects, etc. can trip this check
      serializableCheck: {
        // ignore some known non-serializable bits
        ignoredPaths: [
          "dog.updatedAt",
          "dog._lastRemoteSnapshot",
        ],
        ignoredActionPaths: ["meta.arg", "payload.timestamp"],
        warnAfter: 64, // keep console noise down
      },
      immutableCheck: { warnAfter: 64 },
    })
      // Optional dev logger without adding a hard dep in prod bundles
      .concat(import.meta.env.DEV && maybeLogger()),
});

/** Persist a small slice on changes (fallback cache) */
store.subscribe(
  throttle(() => {
    const state = store.getState();
    savePersistedState(state);
  }, 1500)
);

/** ----------------------- HMR for reducers (Vite) ----------------------- */
if (import.meta.hot) {
  import.meta.hot.accept(["./dogSlice", "./userSlice"], async () => {
    const nextDog = (await import("./dogSlice")).default;
    const nextUser = (await import("./userSlice")).default;
    store.replaceReducer({ dog: nextDog, user: nextUser });
  });
}

/** Optional: lightweight logger (dev only) */
function maybeLogger() {
  try {
    // tiny inline logger to avoid pulling redux-logger
    return () => (next) => (action) => {
      // group collapsed for signal/noise balance
      // eslint-disable-next-line no-console
      console.groupCollapsed(
        `%c${String(action.type)}`,
        "color:#059669;font-weight:600"
      );
      // eslint-disable-next-line no-console
      console.log("payload:", action.payload);
      const result = next(action);
      // eslint-disable-next-line no-console
      console.log("next state:", result === undefined ? undefined : undefined); // keep silent; DevTools shows state
      // eslint-disable-next-line no-console
      console.groupEnd();
      return result;
    };
  } catch {
    return (next) => (action) => next(action);
  }
}

export default store;

/** ------------- JSDoc helpers (DX for JS projects) ------------- */
/**
 * @typedef {ReturnType<typeof store.getState>} RootState
 * @typedef {typeof store.dispatch} AppDispatch
 */
