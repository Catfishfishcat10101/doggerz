// src/components/UI/FeatureStripe.jsx
import React from "react";

export default function FeatureStripe() {
  const items = [
    { k: "offline",  label: "Offline PWA",     desc: "Installs to home screen; works without network." },
    { k: "cloud",    label: "Cloud saves",     desc: "Your pup state follows you across devices." },
    { k: "redux",    label: "Redux Toolkit",   desc: "Deterministic game state & debug-friendly." },
    { k: "fast",     label: "Vite + React 18", desc: "Hot reload, tiny bundles, snappy UI." },
  ];

  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-2">
      {items.map((it) => (
        <div
          key={it.k}
          className="rounded-2xl border border-black/5 dark:border-white/10 bg-white/70 dark:bg-slate-900/60 backdrop-blur p-4"
        >
          <div className="font-semibold">{it.label}</div>
          <div className="text-sm opacity-70">{it.desc}</div>
        </div>
      ))}
    </div>
  );
}
