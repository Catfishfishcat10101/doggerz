// src/hooks/useSessionStorage.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * useSessionStorage(key, initialValue, options?)
 *
 * - SSR-safe lazy read
 * - Functional updates supported
 * - Cross-tab sync via 'storage'
 * - Same-tab sync via CustomEvent channel
 * - Optional BroadcastChannel for robust multi-tab comms
 * - remove(): deletes the key and updates state
 * - Optional migrate(v): transform old value -> new value
 * - Optional versioning: { version, migrate } pair
 */
export default function useSessionStorage(
  key,
  initialValue,
  options = {}
) {
  const {
    migrate,                      // (v) => v'  (run on read)
    version,                      // bump to trigger migrate on version change
    channel = `ss:${key}`,        // CustomEvent/BroadcastChannel name
    useBroadcastChannel = true,
    serializer = JSON.stringify,
    deserializer = JSON.parse,
  } = options;

  const isBrowser = typeof window !== "undefined";
  const bcRef = useRef(null);
  const verKey = useMemo(() => `${key}::version`, [key]);

  const read = useCallback(() => {
    if (!isBrowser) return initialValue;
    try {
      const raw = sessionStorage.getItem(key);
      const storedVer = sessionStorage.getItem(verKey);
      let val = raw != null ? deserializer(raw) : initialValue;

      // migrate if version changed or migrate() provided
      if (typeof migrate === "function" && String(storedVer ?? "") !== String(version ?? "")) {
        val = migrate(val);
        // persist migrated value + version
        sessionStorage.setItem(key, serializer(val));
        if (version != null) sessionStorage.setItem(verKey, String(version));
      }
      return val;
    } catch {
      return initialValue;
    }
  }, [isBrowser, key, verKey, initialValue, migrate, version, serializer, deserializer]);

  const [value, _setValue] = useState(read);

  // Robust writer
  const setValue = useCallback((next) => {
    _setValue((prev) => {
      const resolved = typeof next === "function" ? next(prev) : next;
      if (!isBrowser) return resolved;
      try {
        if (resolved === undefined) {
          sessionStorage.removeItem(key);
          sessionStorage.removeItem(verKey);
        } else {
          sessionStorage.setItem(key, serializer(resolved));
          if (version != null) sessionStorage.setItem(verKey, String(version));
        }
        // same-tab broadcast
        window.dispatchEvent(new CustomEvent(channel, { detail: resolved }));
        // cross-tab broadcast (optional but more reliable than relying on 'storage')
        bcRef.current?.postMessage({ key, value: resolved });
      } catch { /* quota/security */ }
      return resolved;
    });
  }, [isBrowser, key, verKey, serializer, version, channel]);

  const remove = useCallback(() => setValue(undefined), [setValue]);

  // Wire listeners once
  useEffect(() => {
    if (!isBrowser) return;

    // BroadcastChannel (optional)
    if (useBroadcastChannel && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel(channel);
      const onBC = (msg) => {
        if (msg?.key === key) _setValue(msg.value);
      };
      bcRef.current.addEventListener("message", onBC);
      return () => {
        try { bcRef.current.removeEventListener("message", onBC); bcRef.current.close(); } catch {}
      };
    }
  }, [isBrowser, channel, key, useBroadcastChannel]);

  useEffect(() => {
    if (!isBrowser) return;

    // Cross-tab via native 'storage'
    const onStorage = (e) => {
      if (e.storageArea === sessionStorage && e.key === key) {
        try {
          _setValue(e.newValue != null ? deserializer(e.newValue) : undefined);
        } catch {}
      }
      if (e.storageArea === sessionStorage && e.key === verKey) {
        // version changed elsewhere; refresh value
        _setValue(read());
      }
    };

    // Same-tab via CustomEvent
    const onCustom = (e) => _setValue(e.detail);

    window.addEventListener("storage", onStorage);
    window.addEventListener(channel, onCustom);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(channel, onCustom);
    };
  }, [isBrowser, key, verKey, channel, deserializer, read]);

  return [value, setValue, remove];
}
