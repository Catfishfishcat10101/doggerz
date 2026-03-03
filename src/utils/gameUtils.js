// src/utils/gameUtils.js
// Consolidated utility toolbox for app versioning, asset URL resolution,
// and canvas helpers used by game/UI rendering.

/* ---------------- appVersion ---------------- */

export const APP_VERSION =
  typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";

export const IS_DEV_BUILD = APP_VERSION === "dev";

export function normalizeVersionInput(version) {
  const raw = String(version || "").trim();
  if (!raw) return "";
  return raw.startsWith("v") ? raw.slice(1) : raw;
}

export function parseVersion(version) {
  const normalized = normalizeVersionInput(version);
  const match = String(normalized).match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/
  );
  if (!match) {
    return { major: 0, minor: 0, patch: 0, prerelease: normalized };
  }
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || "",
    build: match[5] || "",
  };
}

export function compareVersions(a, b) {
  const pa = parseVersion(a);
  const pb = parseVersion(b);

  if (pa.major !== pb.major) return pa.major < pb.major ? -1 : 1;
  if (pa.minor !== pb.minor) return pa.minor < pb.minor ? -1 : 1;
  if (pa.patch !== pb.patch) return pa.patch < pb.patch ? -1 : 1;

  if (pa.prerelease && !pb.prerelease) return -1;
  if (!pa.prerelease && pb.prerelease) return 1;
  if (pa.prerelease && pb.prerelease) {
    return pa.prerelease.localeCompare(pb.prerelease);
  }

  return 0;
}

export function formatAppVersion(version = APP_VERSION) {
  const v = normalizeVersionInput(version);
  if (!v || v === "dev") return "dev";
  return v.startsWith("v") ? v : `v${v}`;
}

export function isVersionAtLeast(version, minimum) {
  if (!version || !minimum) return false;
  return compareVersions(version, minimum) >= 0;
}

export function getAppVersionMeta() {
  const parsed = parseVersion(APP_VERSION);
  return {
    raw: APP_VERSION,
    display: formatAppVersion(APP_VERSION),
    isDev: IS_DEV_BUILD,
    ...parsed,
  };
}

/* ---------------- assetUrl ---------------- */

const ABSOLUTE_URL_RE = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const PROTOCOL_RELATIVE_RE = /^\/\//;

function getAssetBaseOverride() {
  try {
    const envBase =
      typeof import.meta !== "undefined" && import.meta?.env?.VITE_ASSET_BASE
        ? String(import.meta.env.VITE_ASSET_BASE || "").trim()
        : "";
    if (envBase) return envBase;
  } catch {
    // ignore
  }

  try {
    const winBase =
      typeof window !== "undefined" && window?.DOGGERZ_ASSET_BASE
        ? String(window.DOGGERZ_ASSET_BASE || "").trim()
        : "";
    if (winBase) return winBase;
  } catch {
    // ignore
  }

  return "";
}

export function getBaseUrl() {
  const override = getAssetBaseOverride();
  if (override) {
    return override.endsWith("/") ? override.slice(0, -1) : override;
  }
  try {
    const raw =
      typeof import.meta !== "undefined" && import.meta?.env?.BASE_URL
        ? import.meta.env.BASE_URL
        : "/";
    const base = String(raw || "/");
    return base.endsWith("/") ? base.slice(0, -1) : base;
  } catch {
    return "";
  }
}

export function isAbsoluteUrl(path) {
  const p = String(path || "").trim();
  return ABSOLUTE_URL_RE.test(p) || PROTOCOL_RELATIVE_RE.test(p);
}

export function withBaseUrl(path) {
  const p = String(path || "").trim();
  if (!p) return "";
  if (isAbsoluteUrl(p)) return p;

  const baseNormalized = getBaseUrl();
  if (baseNormalized && p === baseNormalized) return p;
  if (baseNormalized && p.startsWith(`${baseNormalized}/`)) return p;

  if (p.startsWith("/")) return `${baseNormalized}${p}`;
  return `${baseNormalized}/${p}`;
}

export function joinPublicPath(base, file) {
  const b = String(base || "").replace(/\/+$/g, "");
  const f = String(file || "").replace(/^\/+/, "");
  return `${b}/${f}`;
}

export function stripBaseUrl(path) {
  const p = String(path || "").trim();
  if (!p) return "";
  const base = getBaseUrl();
  if (!base) return p;
  if (p === base) return "/";
  if (p.startsWith(`${base}/`)) return p.slice(base.length) || "/";
  return p;
}

/* ---------------- canvasUtils ---------------- */

export function setupCanvasForSprite(
  canvas,
  {
    spriteSize = 128,
    scale = 2,
    enableResize = false,
    devicePixelRatio = null,
    maxDpr = 2,
    smoothing = false,
    background = null,
  } = {}
) {
  if (!canvas) return null;
  const resolvedDpr = Math.max(
    1,
    Math.min(
      Number(maxDpr) || 2,
      devicePixelRatio != null
        ? Number(devicePixelRatio) || 1
        : window.devicePixelRatio || 1
    )
  );

  const applySizing = () => {
    const cssW = Math.round(spriteSize * scale);
    const cssH = Math.round(spriteSize * scale);
    const bufW = Math.round(cssW * resolvedDpr);
    const bufH = Math.round(cssH * resolvedDpr);

    if (canvas.width !== bufW) canvas.width = bufW;
    if (canvas.height !== bufH) canvas.height = bufH;

    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;
    if (background) canvas.style.background = String(background);

    return { cssW, cssH };
  };

  canvas.classList.add("js-managed-canvas");
  const { cssW, cssH } = applySizing();
  const ctx = canvas.getContext("2d");

  if (ctx) {
    try {
      ctx.imageSmoothingEnabled = Boolean(smoothing);
    } catch {
      // ignore
    }
    if (typeof ctx.setTransform === "function") {
      ctx.setTransform(resolvedDpr, 0, 0, resolvedDpr, 0, 0);
    } else if (typeof ctx.scale === "function") {
      try {
        ctx.setTransform && ctx.setTransform(1, 0, 0, 1, 0, 0);
      } catch {
        // ignore
      }
      ctx.scale(resolvedDpr, resolvedDpr);
    }
  }

  let resizeHandler = null;
  if (enableResize) {
    resizeHandler = () => {
      applySizing();
      if (ctx) {
        try {
          ctx.imageSmoothingEnabled = Boolean(smoothing);
        } catch {
          // ignore
        }
        if (typeof ctx.setTransform === "function") {
          ctx.setTransform(resolvedDpr, 0, 0, resolvedDpr, 0, 0);
        } else if (typeof ctx.scale === "function") {
          try {
            ctx.setTransform && ctx.setTransform(1, 0, 0, 1, 0, 0);
          } catch {
            // ignore
          }
          ctx.scale(resolvedDpr, resolvedDpr);
        }
      }
    };

    window.addEventListener("resize", resizeHandler, { passive: true });
  }

  const cleanup = () => {
    if (resizeHandler) window.removeEventListener("resize", resizeHandler);
    try {
      canvas.classList.remove("js-managed-canvas");
    } catch {
      // ignore
    }
  };

  return { ctx, cssW, cssH, dpr: resolvedDpr, cleanup };
}

export function clearCanvas(ctx, w, h) {
  if (!ctx) return;
  const width = Number(w);
  const height = Number(h);
  if (Number.isFinite(width) && Number.isFinite(height)) {
    ctx.clearRect(0, 0, width, height);
  }
}

export function drawCenteredImage(ctx, img, w, h, { scale = 1 } = {}) {
  if (!ctx || !img) return;
  const width = Number(w);
  const height = Number(h);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return;
  const imgW = img?.width || 0;
  const imgH = img?.height || 0;
  if (!imgW || !imgH) return;
  const s = Number(scale) || 1;
  const drawW = imgW * s;
  const drawH = imgH * s;
  const x = (width - drawW) / 2;
  const y = (height - drawH) / 2;
  ctx.drawImage(img, x, y, drawW, drawH);
}

export default setupCanvasForSprite;
