import { format } from "node:util";
import "@testing-library/jest-dom";

if (!window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: "",
    onchange: null,
    addListener: () => undefined,
    removeListener: () => undefined,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    dispatchEvent: () => false,
  });
}

if (!window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {
      // noop
    }
    unobserve() {
      // noop
    }
    disconnect() {
      // noop
    }
  };
}

if (!window.requestAnimationFrame) {
  window.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 16);
}
if (!window.cancelAnimationFrame) {
  window.cancelAnimationFrame = (id) => clearTimeout(id);
}

HTMLCanvasElement.prototype.getContext = () => ({
  clearRect: () => undefined,
  fillRect: () => undefined,
  beginPath: () => undefined,
  moveTo: () => undefined,
  lineTo: () => undefined,
  stroke: () => undefined,
  arc: () => undefined,
  fill: () => undefined,
  setTransform: () => undefined,
});

if (!window.Image) {
  window.Image = class {
    set src(_) {
      if (typeof this.onload === "function") {
        setTimeout(() => this.onload(), 0);
      }
    }
  };
}

try {
  Object.defineProperty(window.location, "reload", {
    configurable: true,
    value: () => undefined,
  });
} catch {
  // ignore
}

try {
  delete window.location;
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...globalThis.location,
      reload: () => undefined,
    },
  });
} catch {
  // ignore
}

const ignoredWarnPatterns = [/React Router Future Flag Warning/i];
const ignoredErrorPatterns = [
  /Not implemented: navigation/i,
  /Not implemented: HTMLCanvasElement\.prototype\.getContext/i,
  /\[Doggerz\] CRITICAL: No dog sprite candidate loaded/i,
  /Warning: Received `true` for a non-boolean attribute `drag`/i,
  /React does not recognize the `dragElastic` prop/i,
  /React does not recognize the `whileTap` prop/i,
  /React does not recognize the `whileDrag` prop/i,
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
