// Basic numerics
export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, v) => (v - a) / (b - a);
export const remap = (inMin, inMax, outMin, outMax, v) =>
  lerp(outMin, outMax, clamp(invLerp(inMin, inMax, v), 0, 1));

export const nearly = (a, b, eps = 1e-6) => Math.abs(a - b) <= eps;

// 2D vectors (plain objects to avoid heap churn)
export const v = (x = 0, y = 0) => ({ x, y });
export const add = (a, b) => v(a.x + b.x, a.y + b.y);
export const sub = (a, b) => v(a.x - b.x, a.y - b.y);
export const mul = (a, s) => v(a.x * s, a.y * s);
export const len = (a) => Math.hypot(a.x, a.y);
export const norm = (a) => {
  const L = len(a) || 1;
  return v(a.x / L, a.y / L);
};

export const rectClamp = (p, rect) => v(
  clamp(p.x, rect.x, rect.x + rect.w),
  clamp(p.y, rect.y, rect.y + rect.h),
);

export const withinRect = (p, rect) =>
  p.x >= rect.x && p.x <= rect.x + rect.w && p.y >= rect.y && p.y <= rect.y + rect.h;
