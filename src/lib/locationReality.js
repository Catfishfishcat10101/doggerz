import { Geolocation } from "@capacitor/geolocation";

function toFiniteNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizePermissionState(permission) {
  return String(permission || "prompt").toLowerCase();
}

export async function getGrantedLocationSnapshot({
  maximumAge = 5 * 60 * 1000,
  timeout = 8000,
  enableHighAccuracy = false,
} = {}) {
  const permission = await Geolocation.checkPermissions().catch(() => null);
  const locationState = normalizePermissionState(
    permission?.coarseLocation || permission?.location
  );

  if (locationState !== "granted") {
    return null;
  }

  const position = await Geolocation.getCurrentPosition({
    enableHighAccuracy,
    timeout,
    maximumAge,
  });

  const latitude = toFiniteNumber(position?.coords?.latitude);
  const longitude = toFiniteNumber(position?.coords?.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    latitude,
    longitude,
    accuracy: toFiniteNumber(position?.coords?.accuracy),
    altitude: toFiniteNumber(position?.coords?.altitude),
    heading: toFiniteNumber(position?.coords?.heading),
    speed: toFiniteNumber(position?.coords?.speed),
    timestamp: toFiniteNumber(position?.timestamp) || Date.now(),
  };
}
