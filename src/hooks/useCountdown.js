// src/hooks/useCountdown.js
import { useEffect, useMemo, useState } from "react";

function toMs(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function formatCountdownMs(ms) {
  const totalSeconds = Math.max(0, Math.ceil(toMs(ms) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function useCountdown(endTime, { intervalMs = 1000 } = {}) {
  const [now, setNow] = useState(() => Date.now());
  const targetMs = toMs(endTime);
  const tickMs = Math.max(250, Math.floor(toMs(intervalMs) || 1000));

  useEffect(() => {
    if (!targetMs) return undefined;

    const tick = () => setNow(Date.now());
    tick();

    if (targetMs <= Date.now()) return undefined;

    const timer = window.setInterval(tick, tickMs);
    return () => window.clearInterval(timer);
  }, [targetMs, tickMs]);

  return useMemo(() => {
    const remainingMs = Math.max(0, targetMs - now);
    return {
      endTime: targetMs || null,
      remainingMs,
      isComplete: remainingMs <= 0,
      formatted: formatCountdownMs(remainingMs),
    };
  }, [now, targetMs]);
}
