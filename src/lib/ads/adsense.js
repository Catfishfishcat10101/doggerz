import { PROD } from "@/config/env.js";
import { ENABLED, UNITS } from "@/config/ads.js";
export function loadAdSense(pubId) {
  if (!PROD || !ENABLED || !pubId) return Promise.resolve(false);
  if (document.querySelector('script[data-adsbygoogle="yes"]')) return Promise.resolve(true);
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(pubId)}`;
    s.crossOrigin = "anonymous";
    s.setAttribute("data-adsbygoogle", "yes");
    s.onload = () => resolve(true);
    s.onerror = () => reject(new Error("AdSense load failed"));
    document.head.appendChild(s);
  });
}
export function fillAd(el) {
  if (!el || !window.adsbygoogle || !Array.isArray(window.adsbygoogle)) return;
  try { window.adsbygoogle.push({}); } catch {}
}
export function resolveUnit(type) {
  if (!type) return "";
  const key = String(type).toLowerCase();
  if (key in UNITS) return UNITS[key];
  return "";
}
