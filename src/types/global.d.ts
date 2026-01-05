export {};

declare global {
  interface Window {
    __DOGGERZ_ERROR_BUCKET__?: unknown;
  }

  // Optional: Vite define-injected version (prevents TS complaining elsewhere)
  const __APP_VERSION__: string | undefined;
}
