// src/utils/notifications.js

export function canUseNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

export async function requestNotificationsPermission() {
  try {
    if (!canUseNotifications()) return "denied";
    if (Notification.permission === "granted") return "granted";
    if (Notification.permission === "denied") return "denied";
    const perm = await Notification.requestPermission();
    return perm;
  } catch {
    return "denied";
  }
}

export async function showDoggerzNotification({ title, body, tag } = {}) {
  try {
    if (!canUseNotifications()) return false;
    if (Notification.permission !== "granted") return false;

    const options = {
      body: String(body || ""),
      tag: tag ? String(tag) : undefined,
      renotify: true,
      icon: "/icons/doggerz-192.png",
      badge: "/icons/doggerz-192.png",
    };

    // Prefer SW notifications if available (better behavior in PWAs).
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && typeof reg.showNotification === "function") {
        await reg.showNotification(String(title || "Doggerz"), options);
        return true;
      }
    }

    // Fallback: in-page notification (works while tab/app is active).
    new Notification(String(title || "Doggerz"), options);
    return true;
  } catch {
    return false;
  }
}
