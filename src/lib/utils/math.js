// src/utils/math.js
export const EPS = 1e-6;

// Scalars
export const clamp = (v, min = 0, max = 1) =>
  v > max ? max : v < min ? min : v;
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => {
  const d = b - a;
  return Math.abs(d) <= EPS ? 0.5 : (v - a) / d;
};
export const remap = (inMin, inMax, outMin, outMax, v) =>
  lerp(outMin, outMax, clamp(invLerp(inMin, inMax, v), 0, 1));
export const damp = (current, target, lambda, dt) =>
  lerp(current, target, 1 - Math.exp(-lambda * dt));

// 2D (minimal)
export const v = (x = 0, y = 0) => ({ x, y });
export const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
export const mul = (a, s) => ({ x: a.x * s, y: a.y * s });
export const len = (a) => Math.hypot(a.x, a.y);
export const norm = (a) => {
  const L = len(a);
  return L > EPS ? { x: a.x / L, y: a.y / L } : { x: 0, y: 0 };
};

// Rect helpers
export const rectClamp = (p, r) => ({
  x: clamp(p.x, r.x, r.x + r.w),
  y: clamp(p.y, r.y, r.y + r.h),
});
export const withinRect = (p, r, inclusive = true) => {
  const x2 = r.x + r.w,
    y2 = r.y + r.h;
  return inclusive
    ? p.x >= r.x && p.x <= x2 && p.y >= r.y && p.y <= y2
    : p.x > r.x && p.x < x2 && p.y > r.y && p.y < y2;
};
