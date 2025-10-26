// src/data/dogRepo/index.js
export function watchDog(uid, onSnapshot) {
  const initial = {
    id: uid,
    name: "Pupper",
    stage: "adult",
    pos: { x: 24, y: 24 },
    hunger: 100,
    energy: 100,
    fun: 100,
    hygiene: 100,
    updatedAt: Date.now(),
  };
  const t = setTimeout(() => {
    try {
      onSnapshot?.(initial);
    } catch {}
  }, 10);
  return () => clearTimeout(t);
}
export async function getDog(uid) {
  return {
    id: uid,
    name: "Pupper",
    stage: "adult",
    pos: { x: 24, y: 24 },
    hunger: 100,
    energy: 100,
    fun: 100,
    hygiene: 100,
    updatedAt: Date.now(),
  };
}
export async function setDog(uid, patch) {
  return { ok: true, at: Date.now(), patch };
}
