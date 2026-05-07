// src/utils/splashScreen.js
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";

function isNativePlatform() {
  try {
    if (Capacitor?.isNativePlatform) return Capacitor.isNativePlatform();
    const platform = Capacitor?.getPlatform?.();
    return Boolean(platform && platform !== "web");
  } catch {
    return false;
  }
}

export async function hideLaunchSplashScreen() {
  if (!isNativePlatform() || !SplashScreen?.hide) return false;

  try {
    await SplashScreen.hide({ fadeOutDuration: 220 });
    return true;
  } catch {
    return false;
  }
}
