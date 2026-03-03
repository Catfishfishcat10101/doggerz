export const APP_VERSION = "test";
export const IS_DEV_BUILD = false;

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
  if (!match) return { major: 0, minor: 0, patch: 0, prerelease: normalized };
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
  if (pa.prerelease && pb.prerelease) return pa.prerelease.localeCompare(pb.prerelease);
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

export function getBaseUrl() {
  return "";
}

export function isAbsoluteUrl(path) {
  const p = String(path || "").trim();
  return /^[a-zA-Z][a-zA-Z\d+.-]*:/.test(p) || /^\/\//.test(p);
}

export function withBaseUrl(path) {
  const p = String(path || "").trim();
  if (!p) return "";
  return p.startsWith("/") ? p : `/${p}`;
}

export function joinPublicPath(base, file) {
  const b = String(base || "").replace(/\/+$/g, "");
  const f = String(file || "").replace(/^\/+/, "");
  return `${b}/${f}`;
}

export function stripBaseUrl(path) {
  return String(path || "").trim();
}

export function setupCanvasForSprite() {
  return null;
}

export function clearCanvas(ctx, w, h) {
  if (!ctx) return;
  ctx.clearRect(0, 0, Number(w), Number(h));
}

export function drawCenteredImage(ctx, img, w, h, { scale = 1 } = {}) {
  if (!ctx || !img) return;
  const drawW = (img.width || 0) * scale;
  const drawH = (img.height || 0) * scale;
  ctx.drawImage(img, (w - drawW) / 2, (h - drawH) / 2, drawW, drawH);
}

export default setupCanvasForSprite;
