export async function registerSW() {
  try {
    // Prevent Vite from resolving at build time when plugin isn't installed
    const { registerSW: _registerSW } = await import(/* @vite-ignore */ "virtual:pwa-register");
    const updateSW = _registerSW({ immediate: true });
    if (import.meta.hot) import.meta.hot.on("vite-pwa:updated", () => updateSW(true));
  } catch {
    console.info("[PWA] Plugin not active; skipping.");
  }
}
