// src/redux/dogThunks.js
import {
  hydrateDog,
  tick,
  feed,
  play,
  rest,
  bathe,

} from "./dogSlice.js";

const STORAGE_KEY = "doggerz:dog";

/**
 * Hard reset the local pup state:
 * - Clears localStorage
 * - Re-hydrates Redux with an empty object (dogSlice will merge with defaults)
 */
export const hardResetDog = () => (dispatch) => {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("[Doggerz] Failed to clear dog localStorage", err);
    }
  }

  // Hydrate with empty object; dogSlice will fallback to its own initialState.
  dispatch(
    hydrateDog({
      // deliberately minimal – slice will overlay its defaults
    })
  );
};

/**
 * Apply an artificial "offline" window in minutes.
 * Useful for testing: e.g. simulate 6 hours away from app.
 */
export const simulateOfflineMinutes = (minutes = 60) => (dispatch) => {
  const ms = Math.max(0, minutes) * 60 * 1000;
  const fakeNow = Date.now() + ms;
  dispatch(
    tick({
      now: fakeNow,
    })
  );
};

/**
 * Quick-care helper: feed, play, rest, bathe, and clean up poop once.
 * Not used in UI yet, but handy for dev tools or future "Auto-care" feature.
 */
export const quickCarePass = () => (dispatch) => {
  dispatch(feed());
  dispatch(play());
  dispatch(rest());
  dispatch(bathe());
};
