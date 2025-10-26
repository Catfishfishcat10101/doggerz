const soundPaths = {
  bark: "/sounds/bark.mp3",
  scoop: "/sounds/scoop.mp3",
  click: "/sounds/click.mp3",
};

const sounds = Object.fromEntries(
  Object.entries(soundPaths).map(([name, path]) => [name, new Audio(path)]),
);
class SoundManager {
  static play(soundName) {
    const sound = sounds[soundName];
    if (!sound) return;
    sound.currentTime = 0;
    sound.play().catch(() => {});
  }
}

export default SoundManager;
