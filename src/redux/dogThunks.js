// src/redux/dogThunks.js
import {
  DOG_STORAGE_KEY,
  hydrateFromSnapshot,
  markHydrated,
  tickDogNeeds,
} from "./dogSlice.js";

/**
 * Safely parse JSON from localStorage.
 */
const safeParse = (raw) => {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Load dog state from localStorage (if present) and hydrate Redux state.
 * Should be dispatched once on app boot (e.g., in main layout or App).
 *
 * Example:
 *   const dispatch = useDispatch();
 *   useEffect(() => {
 *     dispatch(loadDogFromStorage());
 *   }, [dispatch]);
 */
export const loadDogFromStorage = () => (dispatch) => {
  if (typeof window === "undefined") {
    // SSR safety – no-op.
    dispatch(markHydrated());
    return;
  }

  const raw = window.localStorage.getItem(DOG_STORAGE_KEY);
  const snapshot = safeParse(raw);

  if (snapshot && typeof snapshot === "object") {
    dispatch(hydrateFromSnapshot(snapshot));
  } else {
    dispatch(markHydrated());
  }

  // After hydrating, tick needs forward to now.
  dispatch(tickDogNeeds({ nowMs: Date.now() }));
};

/**
 * Persist current dog state into localStorage.
 * Call this after important actions (feed, walk, bath, session end, etc).
 */
export const saveDogToStorage = () => (dispatch, getState) => {
  if (typeof window === "undefined") return;

  const state = getState();
  const dog = state.dog;

  try {
    window.localStorage.setItem(DOG_STORAGE_KEY, JSON.stringify(dog));
  } catch (err) {
    // Local storage can fail (quota, privacy, etc). We just log in dev.
    if (import.meta.env.MODE !== "production") {
      console.warn("[Doggerz] Failed to persist dog state:", err);
    }
  }
};

/**
 * Convenience combo: hydrate from storage, then periodically tick + save.
 * You can build on this later for background timers, etc.
 */
export const bootstrapDogState = () => async (dispatch) => {
  dispatch(loadDogFromStorage());
  // Any extra boot-time logic for the dog can live here later.
};
