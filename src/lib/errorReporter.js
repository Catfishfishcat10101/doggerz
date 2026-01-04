// src/lib/errorReporter.js
// Minimal pluggable error reporter. Consumers can replace `reportError`
// implementation to send errors to an external service.

export function reportError(payload) {
  try {
    // Keep the console log for local debugging
    console.error("[ErrorReporter]", payload);

    // Example hook: if a global reporting function exists, call it.
    if (
      typeof window !== "undefined" &&
      typeof window.__REPORT_ERROR__ === "function"
    ) {
      try {
        window.__REPORT_ERROR__(payload);
      } catch {
        // ignore reporting failures
      }
    }
  } catch {
    // Never throw from the reporter
  }
}
