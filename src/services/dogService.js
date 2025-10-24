// src/services/dogService.js
const KEY = "doggerz:dog";

export async function ensureDogForUser(uid) {
  let existing = null;
  try {
    existing = JSON.parse(localStorage.getItem(KEY) || "null");
  } catch {}
  if (existing && existing.uid === uid) return existing;

  const dog = { uid, id: crypto.randomUUID(), name: null };
  localStorage.setItem(KEY, JSON.stringify(dog));
  return dog;
}

export async function saveDogName(name) {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!d) return null;
    d.name = String(name || "").slice(0, 24);
    localStorage.setItem(KEY, JSON.stringify(d));
    return d;
  } catch { return null; }
}
