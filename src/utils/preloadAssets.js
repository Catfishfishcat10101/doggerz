/** @format */

// src/utils/preloadAssets.js
// Lightweight asset preloading helpers for Doggerz.
// - Safe: resolves even on failures (never blocks the app forever)
// - WebP-aware: prefers .webp but can fall back to .png lists
// - Progress reporting: for splash / skeleton UI

/**
 * Best-effort WebP support probe.
 * NOTE: This is intentionally synchronous so we can decide URLs immediately.
 */
export function supportsWebP() {
  try {
    const canvas = document.createElement('canvas');
    if (!canvas || !canvas.getContext) return false;
    const data = canvas.toDataURL('image/webp');
    return typeof data === 'string' && data.startsWith('data:image/webp');
  } catch {
    return false;
  }
}

function normalizeUrl(u) {
  return String(u || '').trim();
}

/**
 * Preload an image URL.
 * Resolves with: { url, ok, elapsedMs }
 */
export function preloadImage(url, options = {}) {
  const { timeoutMs = 10_000, decode = true } = options;

  const finalUrl = normalizeUrl(url);
  if (!finalUrl) {
    return Promise.resolve({ url: finalUrl, ok: false, elapsedMs: 0 });
  }

  return new Promise((resolve) => {
    const start = performance.now?.() ?? Date.now();
    let done = false;

    const finish = (ok) => {
      if (done) return;
      done = true;
      const end = performance.now?.() ?? Date.now();
      resolve({
        url: finalUrl,
        ok: Boolean(ok),
        elapsedMs: Math.max(0, end - start),
      });
    };

    let timer = null;
    if (Number.isFinite(timeoutMs) && timeoutMs > 0) {
      timer = window.setTimeout(() => finish(false), timeoutMs);
    }

    try {
      const img = new Image();
      img.decoding = 'async';
      // We purposely do NOT set crossOrigin here because these are same-origin /public assets.
      img.onload = async () => {
        try {
          if (decode && typeof img.decode === 'function') {
            // decode() can reject; we treat that as a soft-fail and still proceed.
            await img.decode();
          }
        } catch {
          // ignore
        }
        if (timer) window.clearTimeout(timer);
        finish(true);
      };
      img.onerror = () => {
        if (timer) window.clearTimeout(timer);
        finish(false);
      };
      img.src = finalUrl;
    } catch {
      if (timer) window.clearTimeout(timer);
      finish(false);
    }
  });
}

/**
 * Preload a list of assets with progress callbacks.
 * Resolves with: { total, loaded, okCount, results }
 */
export async function preloadImages(urls, options = {}) {
  const { onProgress, timeoutMs } = options;

  const list = Array.from(
    new Set((urls || []).map(normalizeUrl).filter(Boolean))
  );
  const total = list.length;

  const results = [];
  let loaded = 0;
  let okCount = 0;

  const report = () => {
    if (typeof onProgress === 'function') {
      onProgress({
        total,
        loaded,
        okCount,
        progress01: total > 0 ? loaded / total : 1,
      });
    }
  };

  report();

  // Sequential load keeps bandwidth usage predictable (good for mobile).
  for (const url of list) {
    // eslint-disable-next-line no-await-in-loop
    const r = await preloadImage(url, { timeoutMs });
    results.push(r);
    loaded += 1;
    if (r.ok) okCount += 1;
    report();
  }

  return { total, loaded, okCount, results };
}

/**
 * Doggerz-specific shell assets.
 * Keep this list small — it’s for perceived performance.
 */
export function getDoggerzShellPreloadUrls() {
  const webp = supportsWebP();

  const backgrounds = webp
    ? [
        '/backgrounds/backyard-day.webp',
        '/backgrounds/backyard-night.webp',
        // Optional future drops:
        '/backgrounds/backyard-dawn.webp',
        '/backgrounds/backyard-dusk.webp',
      ]
    : [
        '/backgrounds/backyard-day.png',
        '/backgrounds/backyard-night.png',
        '/backgrounds/backyard-dawn.png',
        '/backgrounds/backyard-dusk.png',
      ];

  const sprites = webp
    ? [
        '/sprites/jack_russell_puppy.webp',
        '/sprites/jack_russell_adult.webp',
        '/sprites/jack_russell_senior.webp',
      ]
    : [
        '/sprites/jack_russell_puppy.png',
        '/sprites/jack_russell_adult.png',
        '/sprites/jack_russell_senior.png',
      ];

  return [...backgrounds, ...sprites];
}
