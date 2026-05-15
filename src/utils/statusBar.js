// src/utils/statusBar.js
import { Capacitor } from "@capacitor/core";

function isNativePlatform() {
  try {
    if (Capacitor?.isNativePlatform) return Capacitor.isNativePlatform();
    const platform = Capacitor?.getPlatform?.();
    return Boolean(platform && platform !== "web");
  } catch {
    return false;
  }
}

export async function configureStatusBar() {
  return isNativePlatform();
}

export async function hideStatusBar() {
  return false;
}

export async function showStatusBar() {
  return false;
}
