// src/pages/Settings.jsx
import React from "react";
import { useDispatch } from "react-redux";
import { resetDogState } from "@/redux/dogSlice";

export default function Settings() {
  const dispatch = useDispatch();

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
