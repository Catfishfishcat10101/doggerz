// src/lib/errorReporter.js
// Minimal pluggable error reporter. Consumers can replace `reportError`
// implementation to send errors to an external service.

export function reportError(payload) {
  try {
    // Keep the console log for local debugging
    // eslint-disable-next-line no-console
    console.error("[ErrorReporter]", payload);

    // Example hook: if a global reporting function exists, call it.
    if (
      typeof window !== "undefined" &&
      typeof window.__REPORT_ERROR__ === "function"
    ) {
      try {
        window.__REPORT_ERROR__(payload);
      } catch (e) {
        // ignore reporting failures
      }
    }
  } catch (e) {
    // Never throw from the reporter
  }
}
