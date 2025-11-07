import React from "react";
import { useDispatch } from "react-redux";
import { resetDogState } from "../redux/dogSlice";

export default function Settings() {
  const dispatch = useDispatch();

  function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.classList.contains("dark");
    root.classList.toggle("dark", !isDark);
    root.classList.toggle("light", isDark);
    localStorage.setItem("theme", isDark ? "light" : "dark");
  }

  function clearLocal() {
    try {
      localStorage.clear();
      sessionStorage.clear();
      alert("Local data cleared.");
    } catch {}
  }

  return (
    <div className="container py-6 text-white">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-xl font-semibold">Appearance</h2>
          <div className="mt-3 flex gap-3">
            <button className="btn" onClick={toggleTheme}>Toggle Dark/Light</button>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold">Data</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            <button className="btn btn--warn" onClick={() => dispatch(resetDogState())}>
              Reset Pup (local)
            </button>
            <button className="btn btn--ghost" onClick={clearLocal}>
              Clear Local Storage
            </button>
          </div>
          <p className="mt-2 text-xs opacity-70">
            Firestore autosave will overwrite local reset on next sync if you’re signed in.
          </p>
        </div>
      </div>
    </div>
  );
}