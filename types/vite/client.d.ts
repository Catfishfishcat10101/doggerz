// Minimal Vite client type stubs for JS projects.
// Use only what Doggerz needs; full definitions come from the real Vite package.

interface ImportMetaEnv {
  readonly MODE?: string;
  readonly BASE_URL?: string;
  readonly DEV?: boolean;
  readonly PROD?: boolean;
  readonly SSR?: boolean;

  readonly VITE_OPENWEATHER_API_KEY?: string;
  readonly VITE_WEATHER_DEFAULT_ZIP?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "vite/client" {}
