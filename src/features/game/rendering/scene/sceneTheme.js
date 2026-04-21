export function getSceneTheme({ isNight = false, weather = "clear" }) {
  return {
    mode: isNight ? "night" : "day",
    weather,
    ambientAlpha: isNight ? 0.42 : 0.12,
    glowAlpha: isNight ? 0.35 : 0,
    groundTint: isNight ? 0xb8c7ff : 0xffffff,
    skyTint: 0xffffff,
  };
}
