/** @format */

// src/utils/debugInfo.js

import { APP_VERSION, getAppVersionMeta } from "@/utils/appVersion.js";
import { getCapturedErrors } from "@/utils/runtimeLogging.js";

function safeTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

function getPwaInfo() {
  if (typeof window === "undefined") return null;
  const hasNavigator = typeof navigator !== "undefined";
  return {
    displayMode: window.matchMedia?.("(display-mode: standalone)")?.matches
      ? "standalone"
      : "browser",
    serviceWorkerSupported: hasNavigator ? "serviceWorker" in navigator : false,
    hasController: hasNavigator
      ? Boolean(navigator.serviceWorker?.controller)
      : false,
  };
}

function getNetworkInfo() {
  if (typeof navigator === "undefined") return null;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) return null;
  return {
    effectiveType: connection.effectiveType || null,
    saveData: Boolean(connection.saveData),
    downlink: Number.isFinite(Number(connection.downlink))
      ? Number(connection.downlink)
      : null,
    rtt: Number.isFinite(Number(connection.rtt)) ? Number(connection.rtt) : null,
  };
}

export function getDebugInfo({ extra = {} } = {}) {
  const now = new Date();

  return {
    app: {
      name: "doggerz",
      version: APP_VERSION,
      meta: getAppVersionMeta(),
    },
    time: {
      iso: now.toISOString(),
      tz: safeTimezone(),
    },
    env: {
      url: typeof window !== "undefined" ? window.location.href : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      online: typeof navigator !== "undefined" ? navigator.onLine : null,
      platform: typeof navigator !== "undefined" ? navigator.platform : null,
      language: typeof navigator !== "undefined" ? navigator.language : null,
      viewport:
        typeof window !== "undefined"
          ? {
              w: window.innerWidth,
              h: window.innerHeight,
              dpr: window.devicePixelRatio || 1,
            }
          : null,
      pwa: getPwaInfo(),
      network: getNetworkInfo(),
    },
    errors: getCapturedErrors(),
    extra,
  };
}

export async function copyDebugInfoToClipboard(info) {
  const payload = JSON.stringify(info, null, 2);

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(payload);
    return;
  }

  // Fallback: best-effort for older browsers
  const ta = document.createElement("textarea");
  ta.value = payload;
  ta.setAttribute("readonly", "true");
  ta.style.position = "fixed";
  ta.style.top = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  document.execCommand("copy");
  document.body.removeChild(ta);
}
