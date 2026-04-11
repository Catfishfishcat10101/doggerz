const PERF_SAMPLES_MAX = 60;
const PERF_STORAGE_KEY = "doggerz:perfSamples:v1";

export const DOGGERZ_PERF_BUDGET = Object.freeze({
  minFps: 42,
  maxLongTasksPerMinute: 10,
  maxHeapUsageRatio: 0.78,
});

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function getPerfBucket() {
  if (typeof window === "undefined") return [];
  if (!Array.isArray(window.__DOGGERZ_PERF_SAMPLES__)) {
    window.__DOGGERZ_PERF_SAMPLES__ = [];
  }
  return window.__DOGGERZ_PERF_SAMPLES__;
}

function persistPerfBucket(bucket) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage?.setItem(
      PERF_STORAGE_KEY,
      JSON.stringify(bucket.slice(-PERF_SAMPLES_MAX))
    );
  } catch {
    // ignore storage failures
  }
}

function recordSample(sample) {
  const bucket = getPerfBucket();
  bucket.push(sample);
  if (bucket.length > PERF_SAMPLES_MAX) {
    bucket.splice(0, bucket.length - PERF_SAMPLES_MAX);
  }
  persistPerfBucket(bucket);
}

function detectDeviceTier() {
  if (typeof navigator === "undefined") return "unknown";
  const memoryGb = Number(navigator.deviceMemory || 0);
  const cores = Number(navigator.hardwareConcurrency || 0);
  const saveData = Boolean(navigator?.connection?.saveData);
  if (
    saveData ||
    (memoryGb > 0 && memoryGb <= 4) ||
    (cores > 0 && cores <= 4)
  ) {
    return "low";
  }
  if ((memoryGb >= 8 && cores >= 8) || (memoryGb >= 6 && cores >= 6)) {
    return "high";
  }
  return "mid";
}

function measureFps(durationMs = 1000) {
  if (typeof window === "undefined" || !window.requestAnimationFrame) {
    return Promise.resolve(0);
  }
  return new Promise((resolve) => {
    const start = performance.now();
    let frames = 0;
    const tick = () => {
      frames += 1;
      const now = performance.now();
      if (now - start >= durationMs) {
        const seconds = Math.max(0.001, (now - start) / 1000);
        resolve(Math.round((frames / seconds) * 10) / 10);
        return;
      }
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  });
}

function readMemoryUsage() {
  if (typeof performance === "undefined" || !performance.memory) {
    return { heapUsedMb: null, heapLimitMb: null, heapUsageRatio: null };
  }
  const used = Number(performance.memory.usedJSHeapSize || 0);
  const limit = Number(performance.memory.jsHeapSizeLimit || 0);
  const heapUsedMb =
    used > 0 ? Math.round((used / (1024 * 1024)) * 10) / 10 : null;
  const heapLimitMb =
    limit > 0 ? Math.round((limit / (1024 * 1024)) * 10) / 10 : null;
  const heapUsageRatio =
    used > 0 && limit > 0 ? Math.round((used / limit) * 1000) / 1000 : null;
  return { heapUsedMb, heapLimitMb, heapUsageRatio };
}

export function getRecentPerfSamples() {
  return [...getPerfBucket()];
}

export function startPerfBudgetMonitor({
  sampleIntervalMs = 60_000,
  onSample = null,
} = {}) {
  if (typeof window === "undefined") return () => {};
  const intervalMs = clamp(sampleIntervalMs, 30_000, 10 * 60_000);
  let running = true;
  let timerId = 0;
  let longTaskCounter = 0;
  let observer = null;
  const tier = detectDeviceTier();
  let warned = false;

  if (typeof PerformanceObserver !== "undefined") {
    try {
      observer = new PerformanceObserver((list) => {
        longTaskCounter += list.getEntries().length;
      });
      observer.observe({ entryTypes: ["longtask"] });
    } catch {
      observer = null;
    }
  }

  const sampleOnce = async () => {
    if (!running) return;
    const fps = await measureFps(900);
    const memory = readMemoryUsage();
    const longTasksPerMinute = Math.round(
      (longTaskCounter * 60_000) / Math.max(1, intervalMs)
    );
    longTaskCounter = 0;

    const sample = {
      at: Date.now(),
      tier,
      fps,
      longTasksPerMinute,
      ...memory,
      overBudget:
        (fps > 0 && fps < DOGGERZ_PERF_BUDGET.minFps) ||
        longTasksPerMinute > DOGGERZ_PERF_BUDGET.maxLongTasksPerMinute ||
        (Number.isFinite(memory.heapUsageRatio) &&
          memory.heapUsageRatio > DOGGERZ_PERF_BUDGET.maxHeapUsageRatio),
    };

    recordSample(sample);
    if (typeof onSample === "function") onSample(sample);
    if (sample.overBudget && !warned) {
      warned = true;
      console.warn("[Doggerz][Perf] budget exceeded", sample);
    }
  };

  const loop = async () => {
    if (!running) return;
    await sampleOnce();
    if (!running) return;
    timerId = window.setTimeout(loop, intervalMs);
  };

  loop();
  return () => {
    running = false;
    if (timerId) window.clearTimeout(timerId);
    if (observer) {
      try {
        observer.disconnect();
      } catch {
        // ignore
      }
    }
  };
}
