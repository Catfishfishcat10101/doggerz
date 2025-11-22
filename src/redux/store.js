// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import dogReducer from '@/redux/dogSlice.js';
import userReducer from '@/redux/userSlice.js';
import { saveDogToStorage } from '@/redux/dogThunks.js';

/**
 * Root Redux store for Doggerz.
 * Add more slices here as the game grows (settingsSlice, uiSlice, shopSlice, etc).
 */

export const store = configureStore({
  reducer: {
    dog: dogReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) => {
    const persistDogMiddleware = (storeAPI) => (next) => (action) => {
      const result = next(action);
      const persistTypes = new Set([
        'dog/feed',
        'dog/play',
        'dog/bathe',
        'dog/goPotty',
        'dog/scoopPoop',
        'dog/trainObedience',
        'dog/registerSessionEnd',
        'dog/hydrateFromSnapshot',
        'dog/tickDogNeeds',
        'dog/setAdoptedAt',
        'dog/setDogName',
      ]);
      if (persistTypes.has(action.type)) {
        // Thunk to persist current state
        storeAPI.dispatch(saveDogToStorage());
      }
      return result;
    };

    return getDefaultMiddleware({
      serializableCheck: {
        ignoredPaths: [],
      },
    }).concat(persistDogMiddleware);
  },
  devTools: import.meta.env.MODE !== 'production',
});

// Convenience types for JS docs or TypeScript interop if you add it later.
// (Not required for JS to work; just here for future-proofing via JSDoc)

/**
 * @typedef {ReturnType<typeof store.getState>} RootState
 */
/**
 * @typedef {typeof store.dispatch} AppDispatch
 */

export default store;
// src/redux/dogThunks.js
