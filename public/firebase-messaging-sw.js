// src/firebase-messaging-sw.js
// Firebase Cloud Messaging service worker for Doggerz

importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/11.10.0/firebase-messaging-compat.js",
);

// The service worker runs in a different global context than the main app.
// Build tools don't automatically inject Vite env vars here. Provide a
// mechanism for the app to set a `self.__FIREBASE_CONFIG__` object at
// runtime (e.g. via `navigator.serviceWorker.controller.postMessage`) or
// bake the config in at build time if you prefer.
const firebaseConfig =
  (self && (self.__FIREBASE_CONFIG__ || self.FIREBASE_CONFIG)) || null;

if (firebaseConfig) {
  try {
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();

    // Handle background push notifications
    messaging.onBackgroundMessage(function (payload) {
      const { title, body, icon } = payload.notification || {};
      self.registration.showNotification(title || "Doggerz", {
        body: body || "You have a new message from your pup!",
        icon: icon || "/icons/icon-192x192.png",
        data: payload.data || {},
      });
    });
  } catch (err) {
    // If initialization fails, don't crash the service worker
    console.warn(
      "Firebase messaging SW init failed:",
      err && err.message ? err.message : err
    );
  }
} else {
  // Not configured; messaging will be disabled. This is normal in dev
  // when you haven't provided firebase credentials to the SW.
  console.warn(
    "Firebase messaging service worker: no firebase config found (set self.__FIREBASE_CONFIG__)."
  );
}

// Handle background push notifications
messaging.onBackgroundMessage(function (payload) {
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || "Doggerz", {
    body: body || "You have a new message from your pup!",
    icon: icon || "/icons/icon-192x192.png",
    data: payload.data || {},
  });
});
