// src/redux/userSelectors.js
export const selectUser = (s) => s.user;
export const selectIsAuthed = (s) => Boolean(s.user?.id);
export const selectUserId = (s) => s.user?.id ?? null;
export const selectEmail = (s) => s.user?.email ?? null;
