// src/components/Features/SoundManager.js
// Simple, app-wide sound helper (singleton).
// - Preloads bark.mp3
// - Handles quick cooldown so multiple calls don't overlap
// - Lets you mute/unmute or set volume globally
// - Unlocks audio on first user gesture (mobile autoplay rules)

import bark from "../../assets/audio/bark.mp3"; // <-- put file here: src/assets/audio/bark.mp3

class SoundManager {
  constructor() {
    this.enabled = true;
    this.volume = 0.8;
    this.cooldowns = {};
    this._unlocked = false;

    // Preload sounds
    this.barkAudio = new Audio(bark);
    this.barkAudio.preload = "auto";
    this.barkAudio.volume = this.volume;
  }

  // Optional: call once in App.jsx useEffect(() => Sound.unlockOnFirstGesture(), [])
  unlockOnFirstGesture() {
    if (this._unlocked) return;
    const tryUnlock = async () => {
      try {
        // Attempt a quick play/pause to satisfy user-gesture requirement
        await this.barkAudio.play();
        this.barkAudio.pause();
        this.barkAudio.currentTime = 0;
        this._unlocked = true;
      } catch {
        // ignore; will try again on next gesture if needed
      }
    };
    const once = async () => {
      await tryUnlock();
      if (this._unlocked) {
        window.removeEventListener("pointerdown", once);
        window.removeEventListener("keydown", once);
        window.removeEventListener("touchstart", once);
      }
    };
    window.addEventListener("pointerdown", once, { once: true });
    window.addEventListener("keydown", once, { once: true });
    window.addEventListener("touchstart", once, { once: true });
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, Number(v) || 0));
    this.barkAudio.volume = this.volume;
  }

  mute() {
    this.enabled = false;
    this.pauseAll();
  }
  unmute() {
    this.enabled = true;
  }

  pauseAll() {
    try { this.barkAudio.pause(); } catch {}
  }

  // --- SFX ---
  bark() {
    if (!this.enabled) return;
    if (this._onCooldown("bark", 200)) return; // prevent rapid spam
    try {
      this.barkAudio.currentTime = 0;
      // play() returns a promise; errors (e.g., no gesture yet) are harmless
      this.barkAudio.play().catch(() => {});
    } catch {
      /* noop */
    }
  }

  // --- Helpers ---
  _onCooldown(key, ms = 150) {
    const now = performance.now();
    const last = this.cooldowns[key] || 0;
    if (now - last < ms) return true;
    this.cooldowns[key] = now;
    return false;
  }
}

const sound = new SoundManager();
export default sound;
