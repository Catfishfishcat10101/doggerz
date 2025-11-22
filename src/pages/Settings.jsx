// src/pages/Settings.jsx
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { resetDogState } from "@/redux/dogSlice";

export default function Settings() {
  const dispatch = useDispatch();
  const [overlay, setOverlay] = useState(() => {
    const v = localStorage.getItem("doggerz.setting.showOverlay");
    return v == null ? true : v === "true";
  });
  const [showNeedsHUD, setShowNeedsHUD] = useState(() => {
    const v = localStorage.getItem("doggerz.setting.showNeedsHUD");
    return v == null ? true : v === "true";
  });
  const [reduced, setReduced] = useState(() => {
    const v = localStorage.getItem("doggerz.setting.reducedMotion");
    return v === "true";
  });
  const [useRealWeather, setUseRealWeather] = useState(() => {
    const v = localStorage.getItem("doggerz.setting.useRealWeather");
    return v === "true";
  });
  const [audioFx, setAudioFx] = useState(() => {
    const v = localStorage.getItem("doggerz.setting.audioFx");
    return v == null ? true : v === "true";
  });
  const [zip, setZip] = useState(() => {
    return localStorage.getItem("doggerz.setting.zip") || "";
  });

  useEffect(() => {
    try { localStorage.setItem("doggerz.setting.showOverlay", String(overlay)); } catch { }
  }, [overlay]);
  useEffect(() => {
    try { localStorage.setItem("doggerz.setting.reducedMotion", String(reduced)); } catch { }
  }, [reduced]);
  useEffect(() => {
    try { localStorage.setItem("doggerz.setting.showNeedsHUD", String(showNeedsHUD)); } catch { }
  }, [showNeedsHUD]);
  useEffect(() => {
    try { localStorage.setItem("doggerz.setting.useRealWeather", String(useRealWeather)); } catch { }
  }, [useRealWeather]);
  useEffect(() => {
    try { localStorage.setItem("doggerz.setting.zip", zip || ""); } catch { }
  }, [zip]);
  useEffect(() => {
    try { localStorage.setItem("doggerz.setting.audioFx", String(audioFx)); } catch { }
  }, [audioFx]);

  // --- THEME TOGGLER ---------------------------------------------------------
  function toggleTheme() {
    const root = document.documentElement;
    const dark = root.classList.contains("dark");

    root.classList.toggle("dark", !dark);
    root.classList.toggle("light", dark);

    localStorage.setItem("theme", dark ? "light" : "dark");
  }

  // --- CLEAR LOCAL ONLY ------------------------------------------------------
  function clearLocal() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      alert("Local app cache cleared.");
    } catch (err) {
      console.error(err);
    }
  }

  // --- UI --------------------------------------------------------------------
  return (
    <div className="min-h-dvh bg-[#0b1020] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6 lg:grid-cols-2">

        {/* Appearance Panel */}
        <div className="card">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <p className="text-sm opacity-70 mt-1">
            Toggle dark/light mode for the entire interface.
          </p>

          <div className="mt-4 flex gap-3">
            <button className="btn" onClick={toggleTheme}>
              Toggle Dark / Light
            </button>
          </div>

          <div className="mt-4 grid gap-2 text-sm">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={overlay}
                onChange={(e) => setOverlay(e.target.checked)}
              />
              Show cleanliness overlay on sprite
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={showNeedsHUD}
                onChange={(e) => setShowNeedsHUD(e.target.checked)}
              />
              Show Needs HUD (top-right)
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={reduced}
                onChange={(e) => setReduced(e.target.checked)}
              />
              Reduced motion (limit sprite animation)
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={audioFx}
                onChange={(e) => setAudioFx(e.target.checked)}
              />
              Enable audio FX (level-up chime)
            </label>
            <div className="h-px bg-zinc-800 my-2" />
            <h3 className="text-sm font-semibold mt-2">Weather</h3>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="accent-emerald-500"
                checked={useRealWeather}
                onChange={(e) => setUseRealWeather(e.target.checked)}
              />
              Use real weather (requires ZIP + API key)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={10}
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/[^0-9A-Za-z-]/g, ''))}
                placeholder="ZIP (e.g., 98101)"
                className="w-40 px-3 py-2 rounded-md bg-zinc-800 border border-zinc-700 text-sm"
              />
              <span className="text-xs text-zinc-500">OpenWeather key in .env as VITE_OPENWEATHER_API_KEY</span>
            </div>
          </div>
        </div>

        {/* Data Panel */}
        <div className="card">
          <h2 className="text-xl font-semibold">Data</h2>
          <p className="text-sm opacity-70 mt-1">
            Manage local save data for Doggerz.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="btn btn--warn"
              onClick={() => dispatch(resetDogState())}
            >
              Reset Pup (Local)
            </button>

            <button className="btn btn--ghost" onClick={clearLocal}>
              Clear Local Storage
            </button>
          </div>

          <p className="mt-3 text-xs opacity-60 leading-snug">
            If you’re signed in, Firestore autosave will sync your cloud profile
            again. Resetting local storage does not delete cloud-stored data.
          </p>
        </div>
      </div>
    </div>
  );
}
