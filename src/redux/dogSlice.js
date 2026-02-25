import { createSelector } from '@reduxjs/toolkit';

const selectDogBase = (state) => state.dog;

export const selectDogRenderModel = createSelector(
  [selectDogBase],
  (dog) => {
    return {
      stage: dog?.stage || 'puppy',
      isDirty: (dog?.stats?.hygiene || 100) < 40,
      isMange: (dog?.stats?.health || 100) < 20,
      currentAction: dog?.currentAction || 'idle',
    };
  }
);
