// src/features/game/useDogLifecycle.jsx
// @ts-nocheck
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { selectDogTemperament } from "@/redux/dogSlice.js";

/**
 * Lightweight lifecycle hook:
 * - Reads temperament from Redux
 * - Exposes whether temperament reveal is ready.
 *
 * NOTE:
 * DogAIEngine (src/features/game/DogAIEngine.jsx) is responsible for:
 *   - registerSessionStart
 *   - tickDog
 *   - tickDogPolls
 *   - persistence
 * so we DO NOT duplicate timers or session registration here.
 */
const REVEAL_AFTER_DAYS = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function clamp01(n) {
  return Math.max(0, Math.min(1, Number.isFinite(n) ? n : 0));
}

function formatEta(ms) {
  if (!Number.isFinite(ms)) return "";
  if (ms <= 0) return "Ready";
  const totalMinutes = Math.ceil(ms / (60 * 1000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours >= 24) {
    const days = Math.ceil(hours / 24);
    return `${days} day${days === 1 ? "" : "s"}`;
  }
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function useDogLifecycle({ nowMs } = {}) {
  const temperament = useSelector(selectDogTemperament);

  const now = Number.isFinite(nowMs) ? nowMs : Date.now();

  const lifecycle = useMemo(() => {
    const adoptedAt = toFiniteNumber(temperament?.adoptedAt);
    const revealedAt = toFiniteNumber(temperament?.revealedAt);
    const revealReady = Boolean(temperament?.revealReady);

    const elapsedMs = adoptedAt ? Math.max(0, now - adoptedAt) : null;
    const revealAfterMs = REVEAL_AFTER_DAYS * DAY_MS;
    const revealEtaMs =
      elapsedMs != null ? Math.max(0, revealAfterMs - elapsedMs) : null;
    const revealProgress =
      elapsedMs != null ? clamp01(elapsedMs / revealAfterMs) : 0;

    const revealStatus = revealedAt
      ? "revealed"
      : revealReady
        ? "ready"
        : adoptedAt
          ? "locked"
          : "unknown";

    return {
      temperament,
      temperamentRevealReady: revealReady && !revealedAt,
      temperamentRevealStatus: revealStatus,
      temperamentRevealProgress: revealProgress,
      temperamentRevealEtaMs: revealEtaMs,
      temperamentRevealEtaLabel: formatEta(revealEtaMs),
      daysSinceAdopted:
        elapsedMs != null ? Math.floor(elapsedMs / DAY_MS) : null,
    };
  }, [now, temperament]);

  return lifecycle;
}

export default useDogLifecycle;
