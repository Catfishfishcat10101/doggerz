// src/redux/userSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  uid: null,
  email: null,
  displayName: null,
  photoURL: null,
  emailVerified: false,
  createdAt: null,
  lastLoginAt: null,
  // Premium subscription state (for monetization)
  subscription: {
    tier: "FREE", // FREE | PREMIUM
    startedAt: null,
    expiresAt: null,
    autoRenew: false,
  },
  // User preferences
  preferences: {
    theme: "dark", // dark | light (future feature)
    notifications: true,
    soundEnabled: true,
    language: "en",
  },
  // Cloud sync metadata
  cloudSync: {
    enabled: false,
    lastSyncAt: null,
    syncErrors: 0,
  },
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, { payload }) {
      if (!payload) return;

      // Core Firebase user fields
      state.uid = payload.uid ?? state.uid;
      state.email = payload.email ?? state.email;
      state.displayName = payload.displayName ?? state.displayName;
      state.photoURL = payload.photoURL ?? state.photoURL;
      state.emailVerified = payload.emailVerified ?? state.emailVerified;

      // Track login timestamp
      if (!state.lastLoginAt) {
        state.lastLoginAt = Date.now();
      }

      // Set creation timestamp if first time
      if (!state.createdAt && payload.metadata?.creationTime) {
        state.createdAt = new Date(payload.metadata.creationTime).getTime();
      }
    },

    updateUserProfile(state, { payload }) {
      // For updating display name, photo, etc.
      if (payload.displayName !== undefined) {
        state.displayName = payload.displayName;
      }
      if (payload.photoURL !== undefined) {
        state.photoURL = payload.photoURL;
      }
    },

    setSubscription(state, { payload }) {
      if (!payload) return;
      state.subscription = {
        ...state.subscription,
        ...payload,
      };
    },

    updatePreferences(state, { payload }) {
      if (!payload || typeof payload !== "object") return;
      state.preferences = {
        ...state.preferences,
        ...payload,
      };
    },

    updateCloudSyncStatus(state, { payload }) {
      const { enabled, lastSyncAt, error } = payload || {};

      if (enabled !== undefined) {
        state.cloudSync.enabled = enabled;
      }

      if (lastSyncAt) {
        state.cloudSync.lastSyncAt = lastSyncAt;
      }

      if (error) {
        state.cloudSync.syncErrors = (state.cloudSync.syncErrors || 0) + 1;
      } else if (error === false) {
        // Reset error count on successful sync
        state.cloudSync.syncErrors = 0;
      }
    },

    recordLogin(state) {
      state.lastLoginAt = Date.now();
    },

    clearUser() {
      return initialState;
    },
  },
});

export const {
  setUser,
  updateUserProfile,
  setSubscription,
  updatePreferences,
  updateCloudSyncStatus,
  recordLogin,
  clearUser,
} = userSlice.actions;

// Selectors
export const selectCurrentUser = (state) => state.user;
export const selectUserSubscription = (state) => state.user.subscription;
export const selectUserPreferences = (state) => state.user.preferences;
export const selectCloudSyncStatus = (state) => state.user.cloudSync;
export const selectIsPremium = (state) =>
  state.user.subscription.tier === "PREMIUM" &&
  (!state.user.subscription.expiresAt ||
    state.user.subscription.expiresAt > Date.now());

export default userSlice.reducer;
