/** @format */

// src/utils/debugInfo.js

import { APP_VERSION } from "@/utils/appVersion.js";
import { getCapturedErrors } from "@/utils/runtimeLogging.js";

export function getDebugInfo({ extra = {} } = {}) {
  const now = new Date();

  return {
    app: {
      name: "doggerz",
      version: APP_VERSION,
    },
    time: {
      iso: now.toISOString(),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    env: {
      url: typeof window !== "undefined" ? window.location.href : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      online: typeof navigator !== "undefined" ? navigator.onLine : null,
      platform: typeof navigator !== "undefined" ? navigator.platform : null,
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
