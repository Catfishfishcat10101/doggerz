// src/hooks/useUserSettings.js
/** @format */

import { createSelector } from "@reduxjs/toolkit";
import { useMemo } from "react";
import { shallowEqual } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/store/hooks.js";
import {
  selectPreferredScene,
  selectReduceVfx,
  selectUiDensity,
  selectUser,
  selectUserCoins,
  selectUserDogName,
  selectUserIsFounder,
  selectUserLocale,
  selectUserStreak,
  selectUserZip,
  setDogName,
  setLocale,
  setPreferredScene,
  setReduceVfx,
  setUiDensity,
  setZip,
} from "@/store/userSlice.js";
import { selectSettings } from "@/store/settingsSlice.js";

const selectUserProfileModel = createSelector(
  [
    selectUser,
    selectUserZip,
    selectUserDogName,
    selectPreferredScene,
    selectReduceVfx,
    selectUiDensity,
    selectUserLocale,
    selectUserCoins,
    selectUserStreak,
    selectUserIsFounder,
  ],
  (
    user,
    zip,
    dogName,
    preferredScene,
    reduceVfx,
    uiDensity,
    locale,
    coins,
    streak,
    isFounder
  ) => ({
    id: user?.id || null,
    displayName: user?.displayName || "Trainer",
    email: user?.email || null,
    avatarUrl: user?.avatarUrl || null,
    zip,
    dogName,
    preferredScene,
    reduceVfx,
    uiDensity,
    locale,
    coins,
    streak,
    isFounder,
  })
);

const selectAudioSettingsModel = createSelector(
  [selectSettings],
  (settings) => ({
    enabled: settings?.audio?.enabled !== false,
    musicEnabled: settings?.audio?.musicEnabled !== false,
    masterVolume: Number(settings?.audio?.masterVolume ?? 0.8),
    musicVolume: Number(settings?.audio?.musicVolume ?? 0.5),
    sfxVolume: Number(settings?.audio?.sfxVolume ?? 0.7),
    sleepEnabled: settings?.audio?.sleepEnabled !== false,
    sleepVolume: Number(settings?.audio?.sleepVolume ?? 0.25),
  })
);

const selectUserSettingsViewModel = createSelector(
  [selectUserProfileModel, selectSettings, selectAudioSettingsModel],
  (profile, settings, audio) => ({
    profile,
    settings,
    audio,
    currentZip: profile.zip,
  })
);

export function useUserState(selector, equalityFn = undefined) {
  return useAppSelector(selector, equalityFn);
}

export function useUser() {
  return useUserState(selectUser);
}

export function useSettingsState() {
  return useUserState(selectSettings, shallowEqual);
}

export function useUserProfile() {
  return useUserState(selectUserProfileModel, shallowEqual);
}

export function useAudioSettings() {
  return useUserState(selectAudioSettingsModel, shallowEqual);
}

export function useUserSettingsView() {
  return useUserState(selectUserSettingsViewModel, shallowEqual);
}

export function useUserActions() {
  const dispatch = useAppDispatch();
  return useMemo(
    () => ({
      setZip: (payload) => dispatch(setZip(payload)),
      setDogName: (payload) => dispatch(setDogName(payload)),
      setPreferredScene: (payload) => dispatch(setPreferredScene(payload)),
      setReduceVfx: (payload) => dispatch(setReduceVfx(payload)),
      setUiDensity: (payload) => dispatch(setUiDensity(payload)),
      setLocale: (payload) => dispatch(setLocale(payload)),
    }),
    [dispatch]
  );
}
