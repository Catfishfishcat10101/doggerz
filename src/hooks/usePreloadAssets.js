/** @format */

// src/hooks/usePreloadAssets.js
import * as React from "react";

/**
 * Preload image URLs (works for <img> and Pixi textures later).
 * Returns { ready, progress }.
 *
 * @param {string[]} urls
 */
export function usePreloadAssets(urls = []) {
  const [ready, setReady] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    const list = (urls || []).filter(Boolean);
    if (list.length === 0) {
      setReady(true);
      setProgress(1);
      return;
    }

    setReady(false);
    setProgress(0);

    let loaded = 0;

    const doneOne = () => {
      loaded += 1;
      if (cancelled) return;
      setProgress(loaded / list.length);
      if (loaded >= list.length) setReady(true);
    };

    const images = list.map((src) => {
      const img = new Image();
      img.onload = doneOne;
      img.onerror = doneOne; // don't block on a missing asset
      img.src = src;
      return img;
    });

    return () => {
      cancelled = true;
      images.forEach((img) => {
        try {
          img.onload = null;
          img.onerror = null;
        } catch {}
      });
    };
  }, [JSON.stringify(urls || [])]);

  return { ready, progress };
}
