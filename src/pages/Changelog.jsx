// src/pages/Changelog.jsx
import React from "react";
export default function Changelog() {
  const ver = typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev";
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-extrabold text-emerald-900">What’s New</h1>
      <p className="text-sm text-emerald-900/70">Build v{ver}</p>
      <ul className="list-disc pl-5 space-y-2 text-emerald-900/80">
        <li>PWA update flow stabilized; offline cache hardening.</li>
        <li>New Controls panel with live key state + gamepad presence.</li>
        <li>Sprite engine with accessory layers and idle breathing.</li>
      </ul>
    </main>
  );
}