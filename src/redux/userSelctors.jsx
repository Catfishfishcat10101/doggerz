// src/redux/userSelectors.js
import { createSelector } from "@reduxjs/toolkit";

export const selectUser = (state) => state.user || {};
export const selectUserId = createSelector([selectUser], (u) => u.id);
export const selectUserEmail = createSelector([selectUser], (u) => u.email);
export const selectDisplayName = createSelector([selectUser], (u) => u.displayName);
export const selectPhotoURL = createSelector([selectUser], (u) => u.photoURL);
export const selectIsAuthenticated = createSelector([selectUser], (u) => Boolean(u?.id));