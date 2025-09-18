// src/components/Features/SettingsModal.jsx
import React from "react";

export default function SettingsModal({ onClose }) {
  const sound = (localStorage.getItem("doggerz_sound") ?? "on") === "on";

  const toggleSound = () => {
    const next = sound ? "off" : "on";
    localStorage.setItem("doggerz_sound", next);
    window.dispatchEvent(new Event("doggerz:soundchange"));
  };

  const clearSession = () => {
    sessionStorage.removeItem("buff");
    sessionStorage.removeItem("yardSkin");
  };

  return (
    <div className="fixed inset-0 bg-black/40 grid place-items-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-rose-900">Settings</h3>

        <div className="mt-4 space-y-3 text-rose-900">
          <button
            className="w-full px-4 py-3 rounded-xl bg-rose-100 text-rose-900 hover:shadow active:scale-95"
            onClick={toggleSound}
          >
            Sound: {sound ? "On 🔊" : "Off 🔇"}
          </button>

          <button
            className="w-full px-4 py-3 rounded-xl bg-rose-100 text-rose-900 hover:shadow active:scale-95"
            onClick={clearSession}
          >
            Clear Session Buffs / Yard Skin
          </button>
        </div>

        <div className="mt-6 text-right">
          <button className="px-4 py-2 rounded-xl bg-rose-600 text-white" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}