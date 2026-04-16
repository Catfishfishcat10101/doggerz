import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

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
  if (!isNativePlatform() || !StatusBar) return false;

  try {
    await Promise.allSettled([
      StatusBar.setOverlaysWebView({ overlay: true }),
      StatusBar.setStyle({ style: Style.Default }),
      StatusBar.hide?.(),
    ]);
    return true;
  } catch {
    return false;
  }
}

export async function hideStatusBar() {
  if (!isNativePlatform() || !StatusBar?.hide) return false;
  try {
    await StatusBar.hide();
    return true;
  } catch {
    return false;
  }
}

export async function showStatusBar() {
  if (!isNativePlatform() || !StatusBar?.show) return false;
  try {
    await StatusBar.show();
    return true;
  } catch {
    return false;
  }
}
