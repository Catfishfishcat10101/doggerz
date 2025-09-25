// src/hooks/useSessionStorage.js
import { useEffect, useState } from "react";

/**
 * Safe sessionStorage hook with SSR guards and cross-tab sync.
 * - Reads once on mount
 * - Updates when you setValue
 * - Listens to 'storage' events (other tabs)
 */
export default function useSessionStorage(key, initialValue) {
  const isBrowser = typeof window !== "undefined";

  const readValue = () => {
    if (!isBrowser) return initialValue;
    try {
      const item = window.sessionStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  };

  const [value, setValue] = useState(readValue);

  useEffect(() => {
    if (!isBrowser) return;
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
      // notify same-tab listeners
      window.dispatchEvent(new StorageEvent("storage", { key, newValue: JSON.stringify(value) }));
    } catch {
      /* ignore quota/security errors */
    }
  }, [key, value, isBrowser]);

  useEffect(() => {
    if (!isBrowser) return;
    const onStorage = (e) => {
      if (e.key === key) {
        try {
          setValue(e.newValue != null ? JSON.parse(e.newValue) : initialValue);
        } catch {
          /* noop */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, initialValue, isBrowser]);

  return [value, setValue];
}
