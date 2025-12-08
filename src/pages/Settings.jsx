// src/pages/Settings.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/redux/hooks.js";
import { resetDogState } from "@/redux/dogSlice";
import { selectUserZip, setZip } from "@/redux/userSlice.js";
import { announce } from "@/utils/announcer.js";

export default function Settings() {
  const dispatch = useAppDispatch();
  const currentZip = useSelector(selectUserZip);
  const [zipInput, setZipInput] = useState(currentZip || "");

  useEffect(() => {
    setZipInput(currentZip || "");
  }, [currentZip]);

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
        {/* Location Panel */}
        <div className="card">
          <h2 className="text-xl font-semibold">Location</h2>
          <p className="text-sm opacity-70 mt-1">
            Set your ZIP code to use local time for the yard background.
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs opacity-70 mb-1" htmlFor="zip">
                Zip code (US)
              </label>
              <input
                id="zip"
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                className="px-3 py-2 rounded-md bg-zinc-900 border border-zinc-700 outline-none focus:border-emerald-500"
                placeholder="e.g. 10001"
                value={zipInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D+/g, "").slice(0, 5);
                  setZipInput(v);
                }}
              />
            </div>
            <button
              className="btn"
              onClick={() => {
                dispatch(setZip(zipInput));
                try {
                  announce({ message: "Settings saved", type: "success" });
                } catch (e) {}
              }}
              disabled={zipInput && !/^\d{5}$/.test(zipInput)}
              title={
                zipInput && !/^\d{5}$/.test(zipInput) ? "Enter 5 digits" : ""
              }
            >
              Save
            </button>
            {/* Geolocation controls removed: ZIP-only by design */}
          </div>

          <div className="mt-3 text-xs opacity-70 leading-snug space-y-1">
            <p>
              Status: <span className="text-zinc-300">Using zip</span>{" "}
              {currentZip ? `(ZIP ${currentZip})` : ""}
            </p>
            <p>
              Requires <code>VITE_OPENWEATHER_API_KEY</code>; without it, the
              game falls back to your device time.
            </p>
          </div>
        </div>

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
