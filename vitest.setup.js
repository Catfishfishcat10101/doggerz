import React from "react";
import { format } from "node:util";
import { expect, vi } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";

// Provide a Jest-compatible global for tests that use `jest.*`.
if (!globalThis.jest) {
  globalThis.jest = vi;
}

if (!globalThis.React) {
  globalThis.React = React;
}

expect.extend(matchers);

if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!globalThis.requestAnimationFrame) {
  globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
  globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
}

if (!globalThis.matchMedia) {
  globalThis.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
  });
}

HTMLCanvasElement.prototype.getContext = () => ({
  clearRect() {},
  drawImage() {},
  setTransform() {},
  scale() {},
});

try {
  Object.defineProperty(window.location, "reload", {
    configurable: true,
    value: () => {},
  });
} catch {}

try {
  Object.defineProperty(window.Location.prototype, "reload", {
    configurable: true,
    value: () => {},
  });
} catch {}

try {
  vi.stubGlobal("location", {
    ...window.location,
    reload: () => {},
  });
} catch {}

try {
  delete window.location;
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...globalThis.location,
      reload: () => {},
    },
  });
} catch {}

const ignoredWarnPatterns = [
  /React Router Future Flag Warning/i,
];

const ignoredErrorPatterns = [
  /Warning: Received `true` for a non-boolean attribute `drag`/i,
  /React does not recognize the `dragElastic` prop/i,
  /React does not recognize the `whileTap` prop/i,
  /React does not recognize the `whileDrag` prop/i,
  /\[Doggerz\] CRITICAL: No dog sprite candidate loaded/i,
  /The above error occurred in the <Thrower>/i,
  /Uncaught error: Error: boom/i,
  /Error: boom/i,
];

const originalWarn = console.warn.bind(console);
const originalError = console.error.bind(console);

console.warn = (...args) => {
  const message = format(...args);
  if (ignoredWarnPatterns.some((pattern) => pattern.test(message))) return;
  originalWarn(...args);
};

console.error = (...args) => {
  const message = format(...args);
  if (ignoredErrorPatterns.some((pattern) => pattern.test(message))) return;
  originalError(...args);
};

try {
  window.addEventListener("error", (event) => {
    if (event?.message && /Error: boom/i.test(event.message)) {
      event.preventDefault();
    }
  });
  window.addEventListener("unhandledrejection", (event) => {
    if (String(event?.reason || "").includes("boom")) {
      event.preventDefault();
    }
  });
} catch {}
