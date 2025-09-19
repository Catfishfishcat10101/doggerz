// src/pages/About.jsx
import React from "react";

export default function About() {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-white">
      <section className="max-w-5xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-emerald-900">About Doggerz</h1>
        <p className="mt-2 text-emerald-900/80">
          Doggerz is a lightweight, offline-friendly creature sim. It leans into the “small web” ethos:
          fast, transparent, and delightful.
        </p>

        <div className="mt-8 grid lg:grid-cols-3 gap-4">
          <Panel title="Architecture" body={
            <ul className="list-disc pl-5 text-sm space-y-1 text-emerald-900/80">
              <li><b>Frontend:</b> Vite + React 18 + React Router</li>
              <li><b>State:</b> Redux Toolkit</li>
              <li><b>PWA:</b> vite-plugin-pwa (autoUpdate)</li>
              <li><b>Sync:</b> Firebase Auth + Firestore (per-user doc)</li>
              <li><b>Styling:</b> Tailwind + small CSS modules for sprites/animations</li>
            </ul>
          }/>
          <Panel title="Design Tenets" body={
            <ul className="list-disc pl-5 text-sm space-y-1 text-emerald-900/80">
              <li><b>Performance-first:</b> instant TTI, predictable frame timings</li>
              <li><b>Resilience:</b> works offline; syncs when online</li>
              <li><b>Privacy:</b> minimal analytics; user owns their save</li>
              <li><b>Accessibility:</b> reduced-motion respect; keyboard-first</li>
            </ul>
          }/>
          <Panel title="Status & Version" body={
            <div className="text-sm text-emerald-900/80">
              Current build: <code className="font-mono">
                v{typeof __APP_VERSION__ === "string" ? __APP_VERSION__ : "dev"}
              </code>
              <div className="mt-1">Roadmap: accessories, breeding, achievements, cloud backups.</div>
            </div>
          }/>
        </div>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <Panel title="PWA Install" body={
            <ol className="list-decimal pl-5 text-sm space-y-1 text-emerald-900/80">
              <li>Open Doggerz in your browser.</li>
              <li>Use the browser’s “Install App / Add to Home Screen”.</li>
              <li>Launch from your home screen—instant play, offline-capable.</li>
            </ol>
          }/>
          <Panel title="Data & Privacy" body={
            <ul className="list-disc pl-5 text-sm space-y-1 text-emerald-900/80">
              <li>Per-user save lives at <code className="font-mono">/dogs/{`{uid}`}</code> in Firestore.</li>
              <li>Only authenticated users can read/write their own doc.</li>
              <li>We cache assets; <code className="font-mono">index.html</code> and SW stay no-cache for updates.</li>
            </ul>
          }/>
        </div>

        <div className="mt-8 rounded-2xl border bg-emerald-50/60 p-4">
          <h3 className="font-semibold text-emerald-900">Credits</h3>
          <p className="text-sm text-emerald-900/80">
            Built with modern web primitives, a soft spot for pixel art, and far too many dog emojis.
          </p>
        </div>
      </section>
    </div>
  );
}

function Panel({ title, body }) {
  return (
    <div className="rounded-2xl bg-white border shadow-sm p-4">
      <h3 className="font-semibold text-emerald-900">{title}</h3>
      <div className="mt-2">{body}</div>
    </div>
  );
}