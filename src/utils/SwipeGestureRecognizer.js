// src/utils/SwipeGestureRecognizer.js
/** @format */

const DEFAULTS = Object.freeze({
  minHorizontalTravelPx: 90,
  maxVerticalDriftPx: 72,
  directionDeltaThresholdPx: 8,
  requiredDirectionChanges: 2,
  gestureWindowMs: 1400,
  cooldownMs: 1200,
});

function getPointerId(event) {
  const value = Number(event?.pointerId);
  return Number.isFinite(value) ? value : -1;
}

function defaultShouldIgnoreTarget(target) {
  if (!target?.closest) return false;
  return Boolean(
    target.closest(
      "button, input, textarea, select, a, [role='button'], [data-doggerz-ignore-swipe='true']"
    )
  );
}

class SwipeGestureRecognizer {
  constructor(options = {}) {
    this.onRecognized =
      typeof options.onRecognized === "function" ? options.onRecognized : null;
    this.shouldIgnoreTarget =
      typeof options.shouldIgnoreTarget === "function"
        ? options.shouldIgnoreTarget
        : defaultShouldIgnoreTarget;

    this.config = {
      minHorizontalTravelPx: Number(options.minHorizontalTravelPx),
      maxVerticalDriftPx: Number(options.maxVerticalDriftPx),
      directionDeltaThresholdPx: Number(options.directionDeltaThresholdPx),
      requiredDirectionChanges: Number(options.requiredDirectionChanges),
      gestureWindowMs: Number(options.gestureWindowMs),
      cooldownMs: Number(options.cooldownMs),
    };

    this.config.minHorizontalTravelPx = Number.isFinite(
      this.config.minHorizontalTravelPx
    )
      ? this.config.minHorizontalTravelPx
      : DEFAULTS.minHorizontalTravelPx;
    this.config.maxVerticalDriftPx = Number.isFinite(
      this.config.maxVerticalDriftPx
    )
      ? this.config.maxVerticalDriftPx
      : DEFAULTS.maxVerticalDriftPx;
    this.config.directionDeltaThresholdPx = Number.isFinite(
      this.config.directionDeltaThresholdPx
    )
      ? this.config.directionDeltaThresholdPx
      : DEFAULTS.directionDeltaThresholdPx;
    this.config.requiredDirectionChanges = Number.isFinite(
      this.config.requiredDirectionChanges
    )
      ? this.config.requiredDirectionChanges
      : DEFAULTS.requiredDirectionChanges;
    this.config.gestureWindowMs = Number.isFinite(this.config.gestureWindowMs)
      ? this.config.gestureWindowMs
      : DEFAULTS.gestureWindowMs;
    this.config.cooldownMs = Number.isFinite(this.config.cooldownMs)
      ? this.config.cooldownMs
      : DEFAULTS.cooldownMs;

    this.lastTriggerAt = 0;
    this.cancel();
  }

  cancel() {
    this.activePointerId = -1;
    this.startedAt = 0;
    this.startX = 0;
    this.startY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.totalHorizontalTravel = 0;
    this.directionChanges = 0;
    this.lastDirection = 0;
    this.active = false;
  }

  start(event) {
    if (!event) return false;
    if (this.shouldIgnoreTarget(event.target)) return false;
    if (this.active) return false;

    this.activePointerId = getPointerId(event);
    this.startedAt = Date.now();
    this.startX = Number(event.clientX || 0);
    this.startY = Number(event.clientY || 0);
    this.lastX = this.startX;
    this.lastY = this.startY;
    this.totalHorizontalTravel = 0;
    this.directionChanges = 0;
    this.lastDirection = 0;
    this.active = true;
    return true;
  }

  move(event) {
    if (!this.active || !event) return false;
    const pointerId = getPointerId(event);
    if (pointerId !== this.activePointerId) return false;

    const now = Date.now();
    if (now - this.startedAt > this.config.gestureWindowMs) {
      this._rearm(Number(event.clientX || 0), Number(event.clientY || 0), now);
      return false;
    }

    const x = Number(event.clientX || 0);
    const y = Number(event.clientY || 0);
    const dyFromStart = Math.abs(y - this.startY);
    if (dyFromStart > this.config.maxVerticalDriftPx) {
      this._rearm(x, y, now);
      return false;
    }

    const dx = x - this.lastX;
    this.lastX = x;
    this.lastY = y;

    if (Math.abs(dx) < this.config.directionDeltaThresholdPx) {
      return false;
    }

    this.totalHorizontalTravel += Math.abs(dx);
    const direction = dx > 0 ? 1 : -1;
    if (this.lastDirection !== 0 && direction !== this.lastDirection) {
      this.directionChanges += 1;
    }
    this.lastDirection = direction;

    const canTrigger =
      this.totalHorizontalTravel >= this.config.minHorizontalTravelPx &&
      this.directionChanges >= this.config.requiredDirectionChanges;

    if (!canTrigger) return false;
    if (now - this.lastTriggerAt < this.config.cooldownMs) {
      this._rearm(x, y, now);
      return false;
    }

    this.lastTriggerAt = now;
    if (this.onRecognized) {
      this.onRecognized(event);
    }
    this._rearm(x, y, now);
    return true;
  }

  end(event) {
    if (!this.active || !event) return false;
    const pointerId = getPointerId(event);
    if (pointerId !== this.activePointerId) return false;
    this.cancel();
    return true;
  }

  _rearm(x, y, startedAt) {
    this.startedAt = startedAt;
    this.startX = x;
    this.startY = y;
    this.lastX = x;
    this.lastY = y;
    this.totalHorizontalTravel = 0;
    this.directionChanges = 0;
    this.lastDirection = 0;
  }
}

export function createSwipeGestureRecognizer(options = {}) {
  return new SwipeGestureRecognizer(options);
}

export default SwipeGestureRecognizer;
