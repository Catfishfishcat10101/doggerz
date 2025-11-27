import { r as d, j as e, b as N, D as p } from "./index-ClZwlZUg.js";
function k({
  zip: s,
  useRealTime: i,
  onZipChange: n,
  onUseRealTimeChange: o,
  openWeatherReady: a,
}) {
  const [m, u] = d.useState(s || ""),
    [h, x] = d.useState(!!i);
  (d.useEffect(() => u(s || ""), [s]), d.useEffect(() => x(!!i), [i]));
  const t = () => {
      n && n((m || "").trim());
    },
    c = (l) => {
      (x(l), o && o(!!l));
    };
  return e.jsxs("div", {
    className: "p-4 rounded-md bg-zinc-900 border border-zinc-800",
    children: [
      e.jsx("h3", {
        className: "text-sm font-semibold",
        children: "Location Settings",
      }),
      e.jsxs("div", {
        className: "mt-2 space-y-2",
        children: [
          e.jsx("label", {
            className: "text-xs text-zinc-400",
            children: "ZIP code",
          }),
          e.jsx("input", {
            value: m,
            onChange: (l) => u(l.target.value),
            onBlur: t,
            className:
              "w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100",
            placeholder: "e.g. 10001",
          }),
          e.jsxs("label", {
            className: "inline-flex items-center gap-2 text-xs",
            children: [
              e.jsx("input", {
                type: "checkbox",
                checked: h,
                onChange: (l) => c(l.target.checked),
              }),
              e.jsx("span", {
                className: "text-zinc-400",
                children: "Use real-time weather & ZIP",
              }),
            ],
          }),
          e.jsx("div", {
            className: "pt-2 flex gap-2 items-center",
            children:
              !a &&
              e.jsx("div", {
                className: "text-xs text-zinc-400",
                children:
                  "OpenWeather key not configured — fallback to device time.",
              }),
          }),
        ],
      }),
    ],
  });
}
function z({ theme: s, accent: i, onThemeChange: n, onAccentChange: o }) {
  const [a, m] = d.useState(s || "dark"),
    [u, h] = d.useState(i || "emerald");
  (d.useEffect(() => m(s || "dark"), [s]),
    d.useEffect(() => h(i || "emerald"), [i]));
  const x = (c) => {
      (m(c), n && n(c));
    },
    t = (c) => {
      (h(c), o && o(c));
    };
  return e.jsxs("div", {
    className: "p-4 rounded-md bg-zinc-900 border border-zinc-800",
    children: [
      e.jsx("h3", {
        className: "text-sm font-semibold",
        children: "Appearance",
      }),
      e.jsxs("div", {
        className: "mt-2 space-y-2",
        children: [
          e.jsxs("div", {
            children: [
              e.jsx("label", {
                className: "text-xs text-zinc-400",
                children: "Theme",
              }),
              e.jsxs("div", {
                className: "mt-1 flex gap-2",
                children: [
                  e.jsx("button", {
                    onClick: () => x("dark"),
                    className: `px-3 py-1 rounded ${a === "dark" ? "bg-emerald-600 text-black" : "bg-zinc-800 text-zinc-200"}`,
                    children: "Dark",
                  }),
                  e.jsx("button", {
                    onClick: () => x("light"),
                    className: `px-3 py-1 rounded ${a === "light" ? "bg-emerald-600 text-black" : "bg-zinc-800 text-zinc-200"}`,
                    children: "Light",
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            children: [
              e.jsx("label", {
                className: "text-xs text-zinc-400",
                children: "Accent color",
              }),
              e.jsxs("select", {
                value: u,
                onChange: (c) => t(c.target.value),
                className:
                  "w-full mt-1 rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100",
                children: [
                  e.jsx("option", { value: "emerald", children: "Emerald" }),
                  e.jsx("option", { value: "teal", children: "Teal" }),
                  e.jsx("option", { value: "violet", children: "Violet" }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function S({
  notificationsEnabled: s,
  soundEnabled: i,
  onNotificationsChange: n,
  onSoundChange: o,
  onDeleteAccount: a,
  onResetLocalDog: m,
  onClearLocalStorage: u,
  onDownloadBackup: h,
}) {
  const [x, t] = d.useState(!!s),
    [c, l] = d.useState(!!i);
  (d.useEffect(() => t(!!s), [s]), d.useEffect(() => l(!!i), [i]));
  const j = () => {
      const g = !x;
      (t(g), n && n(g));
    },
    f = () => {
      const g = !c;
      (l(g), o && o(g));
    };
  return e.jsxs("div", {
    className: "p-4 rounded-md bg-zinc-900 border border-zinc-800",
    children: [
      e.jsx("h3", {
        className: "text-sm font-semibold",
        children: "Data & Device",
      }),
      e.jsx("p", {
        className: "text-xs text-zinc-400 mt-1",
        children: "Manage local saves, notifications, and device preferences.",
      }),
      e.jsxs("div", {
        className: "mt-3 space-y-3",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("div", {
                    className: "text-sm",
                    children: "Notifications",
                  }),
                  e.jsx("div", {
                    className: "text-xs text-zinc-400",
                    children: "Enable browser reminders (permission required)",
                  }),
                ],
              }),
              e.jsx("label", {
                className: "inline-flex items-center",
                children: e.jsx("input", {
                  type: "checkbox",
                  checked: x,
                  onChange: j,
                }),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("div", { className: "text-sm", children: "Sound" }),
                  e.jsx("div", {
                    className: "text-xs text-zinc-400",
                    children: "Play UI sounds and reward chimes",
                  }),
                ],
              }),
              e.jsx("label", {
                className: "inline-flex items-center",
                children: e.jsx("input", {
                  type: "checkbox",
                  checked: c,
                  onChange: f,
                }),
              }),
            ],
          }),
          e.jsx("div", {
            className: "text-xs text-zinc-500",
            children: "Use the header actions for data export / reset.",
          }),
        ],
      }),
    ],
  });
}
function C({
  autoPause: s = !0,
  advancedAnimation: i = !1,
  onAutoPauseChange: n,
  tickWhileAway: o = !1,
  onTickWhileAwayChange: a,
  onAdvancedAnimationChange: m,
}) {
  const [u, h] = d.useState(s),
    [x, t] = d.useState(i),
    [c, l] = d.useState(o);
  (d.useEffect(() => h(s), [s]),
    d.useEffect(() => t(i), [i]),
    d.useEffect(() => l(o), [o]));
  const j = (r) => {
      (h(r), n && n(r));
    },
    f = (r) => {
      (t(r), m && m(r));
    },
    g = (r) => {
      (l(r), a && a(r));
    };
  return e.jsxs("div", {
    className: "p-4 rounded-md bg-zinc-900 border border-zinc-800",
    children: [
      e.jsx("h3", { className: "text-sm font-semibold", children: "Gameplay" }),
      e.jsxs("div", {
        className: "mt-2 space-y-3",
        children: [
          e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("div", {
                    className: "text-sm",
                    children: "Auto-pause",
                  }),
                  e.jsx("div", {
                    className: "text-xs text-zinc-400",
                    children: "Pause engine when the tab is not focused",
                  }),
                ],
              }),
              e.jsx("label", {
                className: "inline-flex items-center",
                children: e.jsx("input", {
                  type: "checkbox",
                  checked: u,
                  onChange: (r) => j(r.target.checked),
                }),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("div", {
                    className: "text-sm",
                    children: "Advanced animations",
                  }),
                  e.jsx("div", {
                    className: "text-xs text-zinc-400",
                    children:
                      "Enable smoother run/idle frames (may affect performance)",
                  }),
                ],
              }),
              e.jsx("label", {
                className: "inline-flex items-center",
                children: e.jsx("input", {
                  type: "checkbox",
                  checked: x,
                  onChange: (r) => f(r.target.checked),
                }),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "flex items-center justify-between",
            children: [
              e.jsxs("div", {
                children: [
                  e.jsx("div", {
                    className: "text-sm",
                    children: "Tick while you're away",
                  }),
                  e.jsx("div", {
                    className: "text-xs text-zinc-400",
                    children:
                      "Continue simulation when tab is not focused (may increase battery use)",
                  }),
                ],
              }),
              e.jsx("label", {
                className: "inline-flex items-center",
                children: e.jsx("input", {
                  type: "checkbox",
                  checked: c,
                  onChange: (r) => g(r.target.checked),
                }),
              }),
            ],
          }),
          e.jsx("div", {
            className: "text-xs text-zinc-500",
            children:
              "Difficulty, bladder model and run animation timing are fixed for consistent gameplay.",
          }),
        ],
      }),
    ],
  });
}
function b({ checked: s, onChange: i, id: n }) {
  return e.jsx("button", {
    id: n,
    role: "switch",
    "aria-checked": !!s,
    onClick: () => i(!s),
    className: `relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 ${s ? "bg-emerald-500" : "bg-zinc-700"}`,
    children: e.jsx("span", {
      className: `inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${s ? "translate-x-5" : "translate-x-1"}`,
    }),
  });
}
const v = "doggerz:settings";
function E() {
  if (typeof window > "u") return "dark";
  try {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      return "dark";
  } catch {}
  return "light";
}
const w = {
  zip: "65401",
  useRealTime: !0,
  theme: E(),
  accent: "emerald",
  bladderModel: "realistic",
  runMs: 800,
  autoPause: !0,
  tickWhileAway: !1,
  difficulty: "normal",
  notificationsEnabled: !0,
  soundEnabled: !0,
  vibrationEnabled: !1,
  shakeOnAction: !0,
  replayCinematic: !1,
  reducedMotion: !1,
  allowCloudSync: !0,
};
function D() {
  if (typeof window > "u") return w;
  try {
    const s = window.localStorage.getItem(v);
    if (!s) return w;
    const i = JSON.parse(s);
    return { ...w, ...i };
  } catch {
    return w;
  }
}
function y(s) {
  if (!(typeof window > "u"))
    try {
      window.localStorage.setItem(v, JSON.stringify(s));
    } catch {}
}
function A() {
  return !1;
}
function R() {
  const [s, i] = d.useState(D),
    n = N(),
    o = A(),
    a = (t) => {
      i((c) => {
        const l = { ...c, ...t };
        return (y(l), l);
      });
    };
  d.useEffect(() => {
    if (typeof document > "u") return;
    const t = document.documentElement;
    s.theme === "dark"
      ? t.classList.add("dark")
      : s.theme === "light" && t.classList.remove("dark");
    const c = s.accent || "emerald";
    t.dataset.accent = c;
  }, [s.theme, s.accent]);
  const m = () => {
      if (
        window.confirm(
          "Reset local pup? This clears local save data for your current dog on THIS device only.",
        )
      ) {
        try {
          window.localStorage.removeItem(p);
        } catch {}
        window.location.reload();
      }
    },
    u = () => {
      if (
        window.confirm(
          "Clear Doggerz local storage? This wipes Doggerz data and preferences on this device. Cloud saves (if signed in) are not deleted.",
        )
      ) {
        try {
          window.localStorage.clear();
        } catch {}
        window.location.reload();
      }
    },
    h = () => {
      if (
        window.confirm(
          "Delete account and all local data? This cannot be undone.",
        )
      ) {
        try {
          (window.localStorage.removeItem(p),
            window.localStorage.removeItem("doggerz:auth"),
            window.localStorage.removeItem(v));
        } catch {}
        window.location.reload();
      }
    },
    x = () => {
      try {
        const t = {
            exportedAt: new Date().toISOString(),
            settings: s,
            dog: null,
          },
          c = window.localStorage.getItem(p);
        if (c)
          try {
            t.dog = JSON.parse(c);
          } catch {
            t.dog = c;
          }
        const l = new Blob([JSON.stringify(t, null, 2)], {
            type: "application/json",
          }),
          j = URL.createObjectURL(l),
          f = document.createElement("a");
        ((f.href = j),
          (f.download = `doggerz-backup-${Date.now()}.json`),
          document.body.appendChild(f),
          f.click(),
          f.remove(),
          URL.revokeObjectURL(j));
      } catch (t) {
        (console.error("[Doggerz] Backup export failed:", t),
          alert("Backup export failed. Check console for details."));
      }
    };
  return e.jsxs("main", {
    className: "max-w-3xl mx-auto px-4 py-8 text-sm md:text-base",
    children: [
      e.jsx("header", {
        className: "mb-6",
        children: e.jsxs("div", {
          className: "flex items-center justify-between gap-6",
          children: [
            e.jsx("div", {
              className: "inline-flex flex-col",
              children: e.jsx("span", {
                className: "text-6xl font-extrabold tracking-tight text-white",
                children: "Doggerz",
              }),
            }),
            e.jsxs("div", {
              children: [
                e.jsx("h1", {
                  className: "text-2xl md:text-3xl font-extrabold text-white",
                  children: "Settings",
                }),
                e.jsx("p", {
                  className: "text-zinc-300 mt-1 max-w-2xl",
                  children: "Fine-tune how Doggerz behaves on this device.",
                }),
              ],
            }),
          ],
        }),
      }),
      e.jsxs("div", {
        className: "bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-sm",
        children: [
          e.jsxs("section", {
            className: "grid gap-8 lg:grid-cols-2 lg:gap-x-16 mt-6",
            children: [
              e.jsx(k, {
                zip: s.zip,
                useRealTime: s.useRealTime,
                onZipChange: (t) => {
                  a({ zip: t });
                  try {
                    n.add("ZIP saved");
                  } catch {}
                },
                onUseRealTimeChange: (t) => {
                  a({ useRealTime: t });
                  try {
                    n.add(t ? "Using real-time weather" : "Using device time");
                  } catch {}
                },
                openWeatherReady: o,
              }),
              e.jsx(z, {
                theme: s.theme,
                accent: s.accent,
                onThemeChange: (t) => {
                  a({ theme: t });
                  try {
                    n.add(`Theme: ${t}`);
                  } catch {}
                },
                onAccentChange: (t) => {
                  a({ accent: t });
                  try {
                    n.add(`Accent: ${t}`);
                  } catch {}
                },
              }),
              e.jsx(S, {
                notificationsEnabled: s.notificationsEnabled,
                soundEnabled: s.soundEnabled,
                onNotificationsChange: (t) => {
                  a({ notificationsEnabled: t });
                  try {
                    n.add(
                      t ? "Notifications enabled" : "Notifications disabled",
                    );
                  } catch {}
                },
                onSoundChange: (t) => {
                  a({ soundEnabled: t });
                  try {
                    n.add(t ? "Sound enabled" : "Sound muted");
                  } catch {}
                },
                onResetLocalDog: m,
                onClearLocalStorage: u,
                onDownloadBackup: x,
                onDeleteAccount: h,
              }),
              e.jsx(C, {
                bladderModel: s.bladderModel,
                runMs: s.runMs,
                difficulty: s.difficulty,
                onBladderModelChange: (t) => a({ bladderModel: t }),
                onRunMsChange: (t) => a({ runMs: t }),
                onDifficultyChange: (t) => a({ difficulty: t }),
                onAutoPauseChange: (t) => a({ autoPause: t }),
                onAdvancedAnimationChange: (t) => a({ advancedAnimation: t }),
                tickWhileAway: s.tickWhileAway,
                onTickWhileAwayChange: (t) => a({ tickWhileAway: t }),
              }),
            ],
          }),
          e.jsxs("div", {
            className: "mt-6 bg-zinc-800/60 dark:bg-zinc-800 rounded-lg p-4",
            children: [
              e.jsx("h2", {
                className: "text-sm font-semibold text-zinc-200 mb-3",
                children: "Quick Toggles",
              }),
              e.jsxs("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                children: [
                  e.jsxs("div", {
                    className:
                      "flex items-center justify-between p-2 rounded hover:bg-zinc-700/30",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("div", {
                            className: "text-sm text-white",
                            children: "Notifications",
                          }),
                          e.jsx("div", {
                            className: "text-xs text-zinc-400",
                            children: "Enable in-app reminders and alerts",
                          }),
                        ],
                      }),
                      e.jsx(b, {
                        checked: !!s.notificationsEnabled,
                        onChange: (t) => {
                          a({ notificationsEnabled: t });
                          try {
                            n.add(
                              t
                                ? "Notifications enabled"
                                : "Notifications disabled",
                            );
                          } catch {}
                        },
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "flex items-center justify-between p-2 rounded hover:bg-zinc-700/30",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("div", {
                            className: "text-sm text-white",
                            children: "Sound",
                          }),
                          e.jsx("div", {
                            className: "text-xs text-zinc-400",
                            children: "In-game sound effects and UI audio",
                          }),
                        ],
                      }),
                      e.jsx(b, {
                        checked: !!s.soundEnabled,
                        onChange: (t) => {
                          a({ soundEnabled: t });
                          try {
                            n.add(t ? "Sound enabled" : "Sound muted");
                          } catch {}
                        },
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "flex items-center justify-between p-2 rounded hover:bg-zinc-700/30",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("div", {
                            className: "text-sm text-white",
                            children: "Vibration",
                          }),
                          e.jsx("div", {
                            className: "text-xs text-zinc-400",
                            children: "Haptic feedback on supported devices",
                          }),
                        ],
                      }),
                      e.jsx(b, {
                        checked: !!s.vibrationEnabled,
                        onChange: (t) => {
                          a({ vibrationEnabled: t });
                          try {
                            n.add(
                              t ? "Vibration enabled" : "Vibration disabled",
                            );
                          } catch {}
                        },
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "flex items-center justify-between p-2 rounded hover:bg-zinc-700/30",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("div", {
                            className: "text-sm text-white",
                            children: "Shake feedback",
                          }),
                          e.jsx("div", {
                            className: "text-xs text-zinc-400",
                            children:
                              "Subtle screen shake for rewarding actions",
                          }),
                        ],
                      }),
                      e.jsx(b, {
                        checked: !!s.shakeOnAction,
                        onChange: (t) => {
                          a({ shakeOnAction: t });
                          try {
                            n.add(
                              t ? "Shake feedback enabled" : "Shake disabled",
                            );
                          } catch {}
                        },
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "flex items-center justify-between p-2 rounded hover:bg-zinc-700/30",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("div", {
                            className: "text-sm text-white",
                            children: "Replay cinematic",
                          }),
                          e.jsx("div", {
                            className: "text-xs text-zinc-400",
                            children:
                              "Automatically replay the intro when visiting home",
                          }),
                        ],
                      }),
                      e.jsx(b, {
                        checked: !!s.replayCinematic,
                        onChange: (t) => {
                          a({ replayCinematic: t });
                          try {
                            n.add(
                              t
                                ? "Cinematic replay enabled"
                                : "Cinematic replay disabled",
                            );
                          } catch {}
                        },
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "flex items-center justify-between p-2 rounded hover:bg-zinc-700/30",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("div", {
                            className: "text-sm text-white",
                            children: "Reduced motion",
                          }),
                          e.jsx("div", {
                            className: "text-xs text-zinc-400",
                            children:
                              "Disable non-essential animations for accessibility",
                          }),
                        ],
                      }),
                      e.jsx(b, {
                        checked: !!s.reducedMotion,
                        onChange: (t) => {
                          a({ reducedMotion: t });
                          try {
                            n.add(
                              t
                                ? "Reduced motion enabled"
                                : "Reduced motion disabled",
                            );
                          } catch {}
                        },
                      }),
                    ],
                  }),
                  e.jsxs("div", {
                    className:
                      "flex items-center justify-between p-2 rounded hover:bg-zinc-700/30",
                    children: [
                      e.jsxs("div", {
                        children: [
                          e.jsx("div", {
                            className: "text-sm text-white",
                            children: "Allow cloud sync",
                          }),
                          e.jsx("div", {
                            className: "text-xs text-zinc-400",
                            children:
                              "Enable automatic cloud saves when signed in",
                          }),
                        ],
                      }),
                      e.jsx(b, {
                        checked: !!s.allowCloudSync,
                        onChange: (t) => {
                          a({ allowCloudSync: t });
                          try {
                            n.add(
                              t
                                ? "Cloud sync allowed"
                                : "Cloud sync disallowed",
                            );
                          } catch {}
                        },
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          e.jsxs("div", {
            className: "mt-8 flex flex-col items-center gap-3",
            children: [
              e.jsx("button", {
                onClick: () => {
                  try {
                    (y(s), n.add("Settings saved"));
                  } catch (t) {
                    (console.error(t), n.add("Failed to save settings"));
                  }
                },
                className:
                  "px-5 py-2.5 rounded bg-emerald-600 text-black font-medium shadow-sm",
                children: "Save Settings",
              }),
              e.jsxs("div", {
                className: "flex flex-col items-center gap-2 mt-2",
                children: [
                  e.jsx("button", {
                    onClick: () => {
                      x();
                      try {
                        n.add("Backup downloaded");
                      } catch {}
                    },
                    className:
                      "w-36 px-3 py-2 text-sm rounded bg-emerald-600 text-black font-semibold",
                    children: "Backup",
                  }),
                  e.jsx("button", {
                    onClick: () => {
                      if (
                        window.confirm(
                          "Clear local Doggerz data on this device?",
                        )
                      ) {
                        u();
                        try {
                          n.add("Local data cleared");
                        } catch {}
                      }
                    },
                    className:
                      "w-36 px-3 py-2 text-sm rounded bg-emerald-600 text-black font-semibold",
                    children: "Clear",
                  }),
                  e.jsx("button", {
                    onClick: () => {
                      if (window.confirm("Delete account and local data?")) {
                        h();
                        try {
                          n.add("Account deleted locally");
                        } catch {}
                      }
                    },
                    className:
                      "w-36 px-3 py-2 text-sm rounded bg-red-600 text-white",
                    children: "Delete",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
export { R as default };
