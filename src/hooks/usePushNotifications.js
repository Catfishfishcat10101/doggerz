// src/hooks/usePushNotifications.js
import { useEffect, useState } from "react";
import {
  messaging,
  isPushSupported,
  getToken,
  onMessage,
  firebaseReady,
} from "@/firebase";

const VAPID_KEY =
  (typeof process !== "undefined" &&
    process.env &&
    process.env.VITE_FIREBASE_VAPID_KEY) ||
  undefined;

export default function usePushNotifications() {
  const [permission, setPermission] = useState(Notification.permission);
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!firebaseReady) return;
    isPushSupported().then((supported) => {
      if (!supported) return setError("Push not supported in this browser.");
      if (Notification.permission === "granted") {
        window?.navigator?.serviceWorker
          ?.getRegistration("/firebase-messaging-sw.js")
          .then((registration) => {
            return getToken(messaging, {
              vapidKey: VAPID_KEY,
              serviceWorkerRegistration: registration,
            });
          })
          .then(setToken)
          .catch(setError);
      }
    });
    // Listen for foreground messages
    if (messaging) {
      onMessage(messaging, (payload) => {
        setMessage(payload);
      });
    }
  }, []);

  const requestPermission = async () => {
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        const reg = await window.navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );
        const t = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: reg,
        });
        setToken(t);
      }
    } catch (err) {
      setError(err.message || String(err));
    }
  };

  return { permission, token, error, message, requestPermission };
}
