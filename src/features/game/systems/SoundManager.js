/**
 * Super-light sound helper. Safe in DEV (won’t crash if file missing).
 * Usage: SoundManager.play("/sfx/click.mp3", { volume: 0.6 })
 */
const _cache = new Map();

async function play(url, { volume = 0.6 } = {}) {
  try {
    if (!url) return; // no-op if nothing passed
    let audio = _cache.get(url);
    if (!audio) {
      audio = new Audio(url);
      _cache.set(url, audio);
    }
    audio.volume = volume;
    audio.currentTime = 0;
    await audio.play();
  } catch (e) {
    if (import.meta.env.DEV) console.info("[SoundManager] muted:", e?.message || e);
  }
}

function preload(urls = []) {
  urls.forEach((url) => {
    if (!_cache.has(url)) _cache.set(url, new Audio(url));
  });
}

export default { play, preload };
