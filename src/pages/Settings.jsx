// src/pages/Settings.jsx
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetDogState } from "@/redux/dogSlice.js";
import {
  selectDogRenderMode,
  selectUserZip,
  setDogRenderMode,
  setZip,
} from "@/redux/userSlice.js";

export default function Settings() {
  const dispatch = useDispatch();
  const currentZip = useSelector(selectUserZip);
  const dogRenderMode = useSelector(selectDogRenderMode);
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

  return (
    <div className="min-h-dvh bg-black text-zinc-50 px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Location Panel */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
          <h2 className="text-xl font-semibold">Location</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Set your ZIP code to use local time (and, later, local weather) for
            the yard background.
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1" htmlFor="zip">
                ZIP (US)
              </label>
              <input
                id="zip"
                inputMode="numeric"
                pattern="[0-9]{5}"
                maxLength={5}
                className="px-3 py-2 rounded-md bg-zinc-950 border border-zinc-700 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 text-sm"
                placeholder="e.g. 10001"
                value={zipInput}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D+/g, "").slice(0, 5);
                  setZipInput(v);
                }}
              />
            </div>
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-emerald-500 text-black text-sm font-semibold disabled:opacity-40"
              onClick={() => dispatch(setZip(zipInput))}
              disabled={zipInput && !/^\d{5}$/.test(zipInput)}
              title={
                zipInput && !/^\d{5}$/.test(zipInput) ? "Enter 5 digits" : ""
              }
            >
              Save ZIP
            </button>
          </div>

          <div className="mt-3 text-xs text-zinc-500 leading-snug space-y-1">
            <p>
              Status: <span className="text-zinc-300">Using ZIP</span>{" "}
              {currentZip ? `(ZIP ${currentZip})` : ""}
            </p>
            <p>
              If <code>VITE_OPENWEATHER_API_KEY</code> is not set, Doggerz falls
              back to your device time only.
            </p>
          </div>
        </div>

        {/* Appearance Panel */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Toggle dark/light mode for the entire interface.
          </p>

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-zinc-800 text-sm font-medium hover:bg-zinc-700"
              onClick={toggleTheme}
            >
              Toggle Dark / Light
            </button>
          </div>

          <div className="mt-6 pt-5 border-t border-zinc-800">
            <h3 className="text-base font-semibold">Dog visuals</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Choose how your dog is rendered in the yard.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold border transition ${dogRenderMode === "sprite"
                  ? "bg-emerald-500 text-black border-emerald-400"
                  : "bg-zinc-900 text-zinc-200 border-zinc-700 hover:border-emerald-400 hover:text-emerald-300"
                  }`}
                onClick={() => dispatch(setDogRenderMode("sprite"))}
              >
                Classic Sprite
              </button>

              <button
                type="button"
                className={`inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold border transition ${dogRenderMode === "realistic"
                  ? "bg-emerald-500 text-black border-emerald-400"
                  : "bg-zinc-900 text-zinc-200 border-zinc-700 hover:border-emerald-400 hover:text-emerald-300"
                  }`}
                onClick={() => dispatch(setDogRenderMode("realistic"))}
              >
                Realistic
              </button>
            </div>

            <p className="mt-3 text-xs text-zinc-500 leading-snug">
              Realistic mode expects an image at{" "}
              <code>/assets/dogs/realistic/dog.svg</code>. If it’s missing,
              Doggerz will fall back to sprites.
            </p>
          </div>
        </div>

        {/* Data Panel */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-5 lg:col-span-2">
          <h2 className="text-xl font-semibold">Data</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Manage local save data for Doggerz.
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md bg-red-500 text-black text-sm font-semibold hover:bg-red-400"
              onClick={() => dispatch(resetDogState())}
            >
              Reset Pup (Local)
            </button>

            <button
              type="button"
              className="inline-flex items-center justify-center px-4 py-2 rounded-md border border-zinc-700 text-sm text-zinc-200 hover:border-emerald-400 hover:text-emerald-300"
              onClick={clearLocal}
            >
              Clear Local Storage
            </button>
          </div>

          <p className="mt-3 text-xs text-zinc-500 leading-snug">
            In future builds with cloud save, Firestore autosave would resync
            your pup profile after a reset. Right now, this only affects local
            data stored in this browser.
          </p>
        </div>
      </div>
    </div>
  );
}
