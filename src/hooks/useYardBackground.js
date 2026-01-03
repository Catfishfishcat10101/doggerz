/** @format */

// src/hooks/useYardBackground.js
import { useEffect, useMemo, useState, useRef } from 'react';

function defaultIsNight(now = new Date(), nightStart = 19, nightEnd = 6) {
  const h = now.getHours();
  if (nightStart <= nightEnd) {
    return h >= nightStart && h < nightEnd;
  }
  // crosses midnight (e.g. 19 -> 6)
  return h >= nightStart || h < nightEnd;
}

function probeUrl(url, timeout = 3000) {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    const img = new Image();
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      img.src = ''; // cancel
      resolve(false);
    }, timeout);

    img.onload = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(true);
    };
    img.onerror = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      resolve(false);
    };
    img.src = url;
  });
}

export default function useYardBackground(options = {}) {
  const {
    dayCandidates = [
      '/assets/backgrounds/yard-day.png',
      '/assets/backgrounds/backyard-day.png',
      '/assets/backgrounds/backyard-split.png',
    ],
    nightCandidates = [
      '/assets/backgrounds/yard-night.png',
      '/assets/backgrounds/backyard-night.png',
      '/assets/backgrounds/backyard-split.png',
    ],
    checkInterval = 30_000,
    nightStart = 19,
    nightEnd = 6,
    probeTimeout = 3000,
  } = options;

  const [isNight, setIsNight] = useState(() =>
    defaultIsNight(new Date(), nightStart, nightEnd)
  );
  const [tick, setTick] = useState(0);
  const [dayUrl, setDayUrl] = useState(null);
  const [nightUrl, setNightUrl] = useState(null);

  const visibleRef = useRef(
    typeof document !== 'undefined'
      ? document.visibilityState === 'visible'
      : true
  );

  // Resolve first available URL from a list of candidates
  useEffect(() => {
    let mounted = true;
    async function resolveList(list, setter) {
      for (const u of list) {
        try {
          const ok = await probeUrl(u, probeTimeout);
          if (ok && mounted) {
            setter(u);
            return;
          }
        } catch {
          // ignore and try next
        }
      }
      if (mounted) setter(null); // no usable image
    }

    resolveList(dayCandidates, setDayUrl);
    resolveList(nightCandidates, setNightUrl);

    return () => {
      mounted = false;
    };
  }, [dayCandidates, nightCandidates, probeTimeout]);

  // Visibility handling to pause checks when hidden
  useEffect(() => {
    function onVis() {
      visibleRef.current = document.visibilityState === 'visible';
    }
    document.addEventListener('visibilitychange', onVis, false);
    return () => document.removeEventListener('visibilitychange', onVis, false);
  }, []);

  // Periodic check for day/night changes; skip when hidden
  useEffect(() => {
    const tickFn = () => {
      if (!visibleRef.current) return;
      const next = defaultIsNight(new Date(), nightStart, nightEnd);
      setIsNight((prev) => {
        if (prev !== next) setTick((x) => x + 1);
        return next;
      });
    };

    // immediate check (in case time crossed while inactive)
    tickFn();
    const id = setInterval(tickFn, checkInterval);
    return () => clearInterval(id);
  }, [checkInterval, nightStart, nightEnd]);

  // expose a single "url" convenience value for the current time of day
  const url = useMemo(
    () => (isNight ? nightUrl : dayUrl),
    [isNight, dayUrl, nightUrl]
  );

  // Back-compat for callers that expect `urls.day` / `urls.night`.
  const urls = useMemo(
    () => ({ day: dayUrl, night: nightUrl }),
    [dayUrl, nightUrl]
  );

  return { isNight, url, dayUrl, nightUrl, urls, tick };
}
