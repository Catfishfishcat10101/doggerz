import React, { useState, useEffect } from "react";

export default function AppearanceSettings({
  theme: propTheme,
  accent: propAccent,
  onThemeChange,
  onAccentChange,
}) {
  const [theme, setTheme] = useState(propTheme || "dark");
  const [accent, setAccent] = useState(propAccent || "emerald");

  useEffect(() => setTheme(propTheme || "dark"), [propTheme]);
  useEffect(() => setAccent(propAccent || "emerald"), [propAccent]);

  // Immediately apply changes via callbacks (no Save button per-panel)
  const setThemeAndNotify = (next) => {
    setTheme(next);
    if (onThemeChange) onThemeChange(next);
  };

  const setAccentAndNotify = (next) => {
    setAccent(next);
    if (onAccentChange) onAccentChange(next);
  };

  return (
    <div className="p-4 rounded-md bg-zinc-900 border border-zinc-800">
      <h3 className="text-sm font-semibold">Appearance</h3>
      <div className="mt-2 space-y-2">
        <div>
          <label className="text-xs text-zinc-400">Theme</label>
          <div className="mt-1 flex gap-2">
            <button
              onClick={() => setThemeAndNotify("dark")}
              className={`px-3 py-1 rounded ${theme === "dark" ? "bg-emerald-600 text-black" : "bg-zinc-800 text-zinc-200"}`}
            >
              Dark
            </button>
            <button
              onClick={() => setThemeAndNotify("light")}
              className={`px-3 py-1 rounded ${theme === "light" ? "bg-emerald-600 text-black" : "bg-zinc-800 text-zinc-200"}`}
            >
              Light
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs text-zinc-400">Accent color</label>
          <select
            value={accent}
            onChange={(e) => setAccentAndNotify(e.target.value)}
            className="w-full mt-1 rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-100"
          >
            <option value="emerald">Emerald</option>
            <option value="teal">Teal</option>
            <option value="violet">Violet</option>
          </select>
        </div>
      </div>
    </div>
  );
}
