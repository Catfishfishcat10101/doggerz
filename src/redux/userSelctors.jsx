// src/redux/userSelectors.js
import { createSelector } from "@reduxjs/toolkit";
import { initialUserState } from "./userSlice.js";

const EMPTY_USER = initialUserState;

/** Root user slice (stable fallback to preserve memoization) */
export const selectUser = (state) => state.user || EMPTY_USER;

export const selectUserId = createSelector([selectUser], (u) => u.id);
export const selectUserEmail = createSelector([selectUser], (u) => u.email);
export const selectDisplayName = createSelector([selectUser], (u) => u.displayName);
export const selectPhotoURL = createSelector([selectUser], (u) => u.photoURL);

/** Derived booleans */
export const selectIsAuthenticated = createSelector([selectUserId], (id) => Boolean(id));
export const selectIsGuest = createSelector([selectIsAuthenticated], (authed) => !authed);

/** Convenience: minimal profile object for headers/nav */
export const selectUserProfile = createSelector([selectUser], (u) => ({
  id: u.id,
  email: u.email,
  displayName: u.displayName,
  photoURL: u.photoURL,
}));