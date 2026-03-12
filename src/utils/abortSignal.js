export function createAbortError(message = "Request aborted") {
  try {
    return new DOMException(String(message || "Request aborted"), "AbortError");
  } catch {
    const error = new Error(String(message || "Request aborted"));
    error.name = "AbortError";
    return error;
  }
}

export function createTimeoutSignal({
  parentSignal,
  timeoutMs = 5000,
  message,
} = {}) {
  const controller = new AbortController();
  const timeout = Number(timeoutMs);
  const reasonText =
    message ||
    (Number.isFinite(timeout) && timeout > 0
      ? `Request timed out after ${timeout}ms`
      : "Request timed out");

  let timeoutId = null;
  let parentAbortHandler = null;

  const abort = (reason = createAbortError(reasonText)) => {
    if (controller.signal.aborted) return;
    controller.abort(reason);
  };

  if (parentSignal) {
    parentAbortHandler = () => {
      abort(parentSignal.reason || createAbortError("Request aborted"));
    };

    if (parentSignal.aborted) {
      parentAbortHandler();
    } else {
      parentSignal.addEventListener("abort", parentAbortHandler, {
        once: true,
      });
    }
  }

  if (Number.isFinite(timeout) && timeout > 0) {
    timeoutId = setTimeout(() => {
      abort(createAbortError(reasonText));
    }, timeout);
  }

  return {
    signal: controller.signal,
    abort,
    cleanup() {
      if (timeoutId != null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      if (parentSignal && parentAbortHandler) {
        parentSignal.removeEventListener("abort", parentAbortHandler);
        parentAbortHandler = null;
      }
    },
  };
}
