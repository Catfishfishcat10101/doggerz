// src/pages/Settings.jsx
// @ts-nocheck
//
// Doggerz Settings page:
// - Location (ZIP + real-time vs device time)
// - Appearance (theme + accent color)
// - Data (reset pup, clear local, JSON backup)
// - Gameplay (bladder model, difficulty, run animation, auto-pause)

import React, { useEffect, useState } from "react";
// Use @ alias for all feature imports for consistency
import LocationSettings from "@/features/settings/components/LocationSettings.jsx";
import AppearanceSettings from "@/features/settings/components/AppearanceSettings.jsx";
import DataSettings from "@/features/settings/components/DataSettings.jsx";
import GameplaySettings from "@/features/settings/components/GameplaySettings.jsx";
import { useToast } from "@/components/ToastProvider.jsx";
import ToggleSwitch from "@/components/ToggleSwitch.jsx";
import { DOG_STORAGE_KEY } from "@/redux/dogSlice.js";

const SETTINGS_STORAGE_KEY = "doggerz:settings";

function getSystemTheme() {
  if (typeof window === "undefined") return "dark";
  try {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // ignore
  }
  return "light";
}

const DEFAULT_SETTINGS = {
  zip: "65401",
  useRealTime: true, // true = real-world time; false = device-only
  theme: getSystemTheme(), // "dark" | "light" | "system" (we map "system" at load time)
  accent: "emerald", // "emerald" | "teal" | "violet"
  bladderModel: "realistic", // "realistic" | "meals"
  runMs: 800, // sprint animation
  autoPause: true, // auto-pause DogAI when tab not focused
  tickWhileAway: false, // keep sim running while away (inverse of autoPause)
  difficulty: "normal", // "chill" | "normal" | "hard"
  // Additional toggles
  notificationsEnabled: true,
  soundEnabled: true,
  vibrationEnabled: false,
  shakeOnAction: true,
  replayCinematic: false,
  reducedMotion: false,
  allowCloudSync: true,
};

/**
 * Load settings from localStorage and merge with defaults.
 */
function loadSettings() {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Persist settings to localStorage.
 */
function saveSettings(next) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota etc.
  }
}

function hasOpenWeatherKey() {
  return Boolean(import.meta.env.VITE_OPENWEATHER_API_KEY);
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(loadSettings);

  const toast = useToast();

  const openWeatherReady = hasOpenWeatherKey();

  const updateSettings = (patch) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  };

  // Apply theme + accent to the document root
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;

    // Theme
    if (settings.theme === "dark") {
      root.classList.add("dark");
    } else if (settings.theme === "light") {
      root.classList.remove("dark");
    }

    // Accent token (you can wire Tailwind/custom CSS to this)
    const accent = settings.accent || "emerald";
    root.dataset.accent = accent;
  }, [settings.theme, settings.accent]);

  const handleResetLocalDog = () => {
    if (
      !window.confirm(
        "Reset local pup? This clears local save data for your current dog on THIS device only.",
      )
    ) {
      return;
    }

    try {
      window.localStorage.removeItem(DOG_STORAGE_KEY);
    } catch {
      // ignore
    }

    window.location.reload();
  };

  const handleClearLocalStorage = () => {
    if (
      !window.confirm(
        "Clear Doggerz local storage? This wipes Doggerz data and preferences on this device. Cloud saves (if signed in) are not deleted.",
      )
    ) {
      return;
    }

    try {
      window.localStorage.clear();
    } catch {
      // ignore
    }

    window.location.reload();
  };

  const handleDeleteAccount = () => {
    if (
      !window.confirm(
        "Delete account and all local data? This cannot be undone.",
      )
    )
      return;
    try {
      window.localStorage.removeItem(DOG_STORAGE_KEY);
      window.localStorage.removeItem("doggerz:auth");
      window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    } catch {}
    window.location.reload();
  };

  const handleDownloadBackup = () => {
    try {
      const payload = {
        exportedAt: new Date().toISOString(),
        settings,
        dog: null,
      };

      const rawDog = window.localStorage.getItem(DOG_STORAGE_KEY);
      if (rawDog) {
        try {
          payload.dog = JSON.parse(rawDog);
        } catch {
          payload.dog = rawDog;
        }
      }

      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `doggerz-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("[Doggerz] Backup export failed:", err);
      alert("Backup export failed. Check console for details.");
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8 text-sm md:text-base">
      <header className="mb-6">
        <div className="flex items-center justify-between gap-6">
          <div className="inline-flex flex-col">
            <span className="text-6xl font-extrabold tracking-tight text-white">
              Doggerz
            </span>
            {/* subtitle removed per request */}
          </div>

          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Settings
            </h1>
            <p className="text-zinc-300 mt-1 max-w-2xl">
              Fine-tune how Doggerz behaves on this device.
            </p>
          </div>
        </div>
      </header>

      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm">
        <section className="grid gap-8 lg:grid-cols-2 lg:gap-x-16 mt-6">
          <LocationSettings
            zip={settings.zip}
            useRealTime={settings.useRealTime}
            onZipChange={(zip) => {
              updateSettings({ zip });
              try {
                toast.add("ZIP saved");
              } catch {}
            }}
            onUseRealTimeChange={(useRealTime) => {
              updateSettings({ useRealTime });
              try {
                toast.add(
                  useRealTime ? "Using real-time weather" : "Using device time",
                );
              } catch {}
            }}
            openWeatherReady={openWeatherReady}
          />

          <AppearanceSettings
            theme={settings.theme}
            accent={settings.accent}
            onThemeChange={(theme) => {
              updateSettings({ theme });
              try {
                toast.add(`Theme: ${theme}`);
              } catch {}
            }}
            onAccentChange={(accent) => {
              updateSettings({ accent });
              try {
                toast.add(`Accent: ${accent}`);
              } catch {}
            }}
          />

          <DataSettings
            notificationsEnabled={settings.notificationsEnabled}
            soundEnabled={settings.soundEnabled}
            onNotificationsChange={(notificationsEnabled) => {
              updateSettings({ notificationsEnabled });
              try {
                toast.add(
                  notificationsEnabled
                    ? "Notifications enabled"
                    : "Notifications disabled",
                );
              } catch {}
            }}
            onSoundChange={(soundEnabled) => {
              updateSettings({ soundEnabled });
              try {
                toast.add(soundEnabled ? "Sound enabled" : "Sound muted");
              } catch {}
            }}
            onResetLocalDog={handleResetLocalDog}
            onClearLocalStorage={handleClearLocalStorage}
            onDownloadBackup={handleDownloadBackup}
            onDeleteAccount={handleDeleteAccount}
          />

          <GameplaySettings
            bladderModel={settings.bladderModel}
            runMs={settings.runMs}
            difficulty={settings.difficulty}
            onBladderModelChange={(bladderModel) =>
              updateSettings({ bladderModel })
            }
            onRunMsChange={(runMs) => updateSettings({ runMs })}
            onDifficultyChange={(difficulty) => updateSettings({ difficulty })}
            onAutoPauseChange={(autoPause) => updateSettings({ autoPause })}
            onAdvancedAnimationChange={(advancedAnimation) =>
              updateSettings({ advancedAnimation })
            }
            tickWhileAway={settings.tickWhileAway}
            onTickWhileAwayChange={(tickWhileAway) =>
              updateSettings({ tickWhileAway })
            }
          />
        </section>

        {/* Quick toggles: small, commonly-used options */}
        <div className="mt-6 bg-zinc-800/60 dark:bg-zinc-800 rounded-lg p-4">
          <h2 className="text-sm font-semibold text-zinc-200 mb-3">
            Quick Toggles
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/** Notifications */}
            <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-700/30">
              <div>
                <div className="text-sm text-white">Notifications</div>
                <div className="text-xs text-zinc-400">
                  Enable in-app reminders and alerts
                </div>
              </div>
              <ToggleSwitch
                checked={Boolean(settings.notificationsEnabled)}
                onChange={(v) => {
                  updateSettings({ notificationsEnabled: v });
                  try {
                    toast.add(
                      v ? "Notifications enabled" : "Notifications disabled",
                    );
                  } catch {}
                }}
              />
            </div>

            {/** Sound */}
            <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-700/30">
              <div>
                <div className="text-sm text-white">Sound</div>
                <div className="text-xs text-zinc-400">
                  In-game sound effects and UI audio
                </div>
              </div>
              <ToggleSwitch
                checked={Boolean(settings.soundEnabled)}
                onChange={(v) => {
                  updateSettings({ soundEnabled: v });
                  try {
                    toast.add(v ? "Sound enabled" : "Sound muted");
                  } catch {}
                }}
              />
            </div>

            {/** Vibration */}
            <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-700/30">
              <div>
                <div className="text-sm text-white">Vibration</div>
                <div className="text-xs text-zinc-400">
                  Haptic feedback on supported devices
                </div>
              </div>
              <ToggleSwitch
                checked={Boolean(settings.vibrationEnabled)}
                onChange={(v) => {
                  updateSettings({ vibrationEnabled: v });
                  try {
                    toast.add(v ? "Vibration enabled" : "Vibration disabled");
                  } catch {}
                }}
              />
            </div>

            {/** Shake on action */}
            <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-700/30">
              <div>
                <div className="text-sm text-white">Shake feedback</div>
                <div className="text-xs text-zinc-400">
                  Subtle screen shake for rewarding actions
                </div>
              </div>
              <ToggleSwitch
                checked={Boolean(settings.shakeOnAction)}
                onChange={(v) => {
                  updateSettings({ shakeOnAction: v });
                  try {
                    toast.add(v ? "Shake feedback enabled" : "Shake disabled");
                  } catch {}
                }}
              />
            </div>

            {/** Replay cinematic */}
            <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-700/30">
              <div>
                <div className="text-sm text-white">Replay cinematic</div>
                <div className="text-xs text-zinc-400">
                  Automatically replay the intro when visiting home
                </div>
              </div>
              <ToggleSwitch
                checked={Boolean(settings.replayCinematic)}
                onChange={(v) => {
                  updateSettings({ replayCinematic: v });
                  try {
                    toast.add(
                      v
                        ? "Cinematic replay enabled"
                        : "Cinematic replay disabled",
                    );
                  } catch {}
                }}
              />
            </div>

            {/** Reduced motion */}
            <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-700/30">
              <div>
                <div className="text-sm text-white">Reduced motion</div>
                <div className="text-xs text-zinc-400">
                  Disable non-essential animations for accessibility
                </div>
              </div>
              <ToggleSwitch
                checked={Boolean(settings.reducedMotion)}
                onChange={(v) => {
                  updateSettings({ reducedMotion: v });
                  try {
                    toast.add(
                      v ? "Reduced motion enabled" : "Reduced motion disabled",
                    );
                  } catch {}
                }}
              />
            </div>

            {/** Cloud sync */}
            <div className="flex items-center justify-between p-2 rounded hover:bg-zinc-700/30">
              <div>
                <div className="text-sm text-white">Allow cloud sync</div>
                <div className="text-xs text-zinc-400">
                  Enable automatic cloud saves when signed in
                </div>
              </div>
              <ToggleSwitch
                checked={Boolean(settings.allowCloudSync)}
                onChange={(v) => {
                  updateSettings({ allowCloudSync: v });
                  try {
                    toast.add(
                      v ? "Cloud sync allowed" : "Cloud sync disallowed",
                    );
                  } catch {}
                }}
              />
            </div>
          </div>
        </div>

        {/* Save + actions: central, non-fixed, stacked layout */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <button
            onClick={() => {
              try {
                saveSettings(settings);
                toast.add("Settings saved");
              } catch (e) {
                console.error(e);
                toast.add("Failed to save settings");
              }
            }}
            className="px-5 py-2.5 rounded bg-emerald-600 text-black font-medium shadow-sm"
          >
            Save Settings
          </button>

          <div className="flex flex-col items-center gap-2 mt-2">
            <button
              onClick={() => {
                handleDownloadBackup();
                try {
                  toast.add("Backup downloaded");
                } catch {}
              }}
              className="w-36 px-3 py-2 text-sm rounded bg-emerald-600 text-black font-semibold"
            >
              Backup
            </button>

            <button
              onClick={() => {
                if (
                  window.confirm("Clear local Doggerz data on this device?")
                ) {
                  handleClearLocalStorage();
                  try {
                    toast.add("Local data cleared");
                  } catch {}
                }
              }}
              className="w-36 px-3 py-2 text-sm rounded bg-emerald-600 text-black font-semibold"
            >
              Clear
            </button>

            <button
              onClick={() => {
                if (window.confirm("Delete account and local data?")) {
                  handleDeleteAccount();
                  try {
                    toast.add("Account deleted locally");
                  } catch {}
                }
              }}
              className="w-36 px-3 py-2 text-sm rounded bg-red-600 text-white"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
