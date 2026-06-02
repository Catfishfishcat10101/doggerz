export const DOG_STORAGE_KEY = "doggerz:dogState";
export const DOG_GUEST_STORAGE_KEY = `${DOG_STORAGE_KEY}:guest`;
export const DOG_SAVE_SCHEMA_VERSION = 1;

export function getDogStorageKey(userId) {
  const raw = String(userId || "").trim();
  return raw ? `${DOG_STORAGE_KEY}:${raw}` : DOG_GUEST_STORAGE_KEY;
}
