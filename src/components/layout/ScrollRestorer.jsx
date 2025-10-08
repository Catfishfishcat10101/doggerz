// src/layout/ScrollRestorer.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollRestorer
 * - Persists scrollY per location.key in sessionStorage.
 * - Restores on back/forward; scrolls to top on new nav.
 * - Works alongside browser history.scrollRestoration when available.
 */
export default function ScrollRestorer() {
  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      // Let us handle it for SPA routes to avoid jank
      const prev = history.scrollRestoration;
      history.scrollRestoration = "manual";
      return () => {
        history.scrollRestoration = prev;
      };
    }
  }, []);

  useEffect(() => {
    const key = location.key || location.pathname;

    // On route change, try restore prior position
    const saved = sessionStorage.getItem(`scroll:${key}`);
    const y = saved ? parseInt(saved, 10) : 0;

    // Use instant jump to avoid motion; browser can smooth if user wants
    window.scrollTo({ top: y, behavior: "auto" });

    const onScroll = () => {
      // Throttle-ish write; micro-optimizations not critical here
      sessionStorage.setItem(`scroll:${key}`, String(window.scrollY || 0));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.key, location.pathname]);

  return null;
}
