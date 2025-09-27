// src/components/Features/SoundManager.js
// Tiny sound helper. Honors localStorage "doggerz_sound" = "on" | "off"

const sounds = {
  bark: new Audio("/sounds/bark.mp3"),   // add these files under /public/sounds if you have them
  scoop: new Audio("/sounds/scoop.mp3"),
  click: new Audio("/sounds/click.mp3"),
};

function enabled() {
  return (localStorage.getItem("doggerz_sound") ?? "on") === "on";
}

export default {
  play(name) {
    try {
      if (!enabled()) return;
      const a = sounds[name];
      if (a) {
        a.currentTime = 0;
        a.play().catch(() => {});
      }
    } catch {}
  },
};