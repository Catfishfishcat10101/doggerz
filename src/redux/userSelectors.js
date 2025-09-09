export const selectUser = (state) => state.user;
export const selectUserId = (state) => state.user?.id ?? null;
export const selectUserEmail = (state) => state.user?.email ?? null;
export const selectIsAuthed = (state) => Boolean(state.user?.id);