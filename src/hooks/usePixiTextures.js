/** @format */

// src/hooks/usePixiTextures.js
import * as React from "react";
import { Assets } from "pixi.js";

/**
 * Load Pixi assets for a list of URLs and return a map keyed by URL.
 * Progress is reported from 0..1.
 * @param {string[]} urls
 * @param {(progress:number)=>void} [onProgress]
 */
export async function loadTextures(urls = [], onProgress) {
  const list = (urls || []).filter(Boolean);
  const total = list.length;
  if (total === 0) {
    onProgress?.(1);
    return {};
  }

  onProgress?.(0);

  const out = {};
  let done = 0;

  for (const url of list) {
    // Assets.load returns the loaded asset (often a Texture) for a given URL.
    // Load sequentially to provide deterministic progress updates.
    out[url] = await Assets.load(url);
    done += 1;
    onProgress?.(done / total);
  }

  return out;
}

/**
 * Preload Pixi textures from URLs with progress.
 * @param {string[]} urls
 */
export function usePixiTextures(urls = []) {
  const [ready, setReady] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [textures, setTextures] = React.useState({});

  React.useEffect(() => {
    let cancelled = false;

    const list = (urls || []).filter(Boolean);
    if (list.length === 0) {
      setReady(true);
      setProgress(1);
      setTextures({});
      return;
    }

    setReady(false);
    setProgress(0);

    (async () => {
      try {
        const res = await loadTextures(list, (p) => {
          if (!cancelled) setProgress(p);
        });
        if (!cancelled) {
          setTextures(res);
          setReady(true);
          setProgress(1);
        }
      } catch (e) {
        // Don't hard-crash the app if an asset is missing
        console.error("[usePixiTextures] preload failed:", e);
        if (!cancelled) {
          setTextures({});
          setReady(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(urls || [])]);

  return { ready, progress, textures };
}
export default usePixiTextures;
