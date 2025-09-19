// src/pages/Help.jsx
import React from "react";
import { Link } from "react-router-dom";
export default function Help() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-extrabold text-emerald-900">Help & FAQ</h1>
      <Section q="How do I move/bark/speed time?">
        WASD/Arrows to move, <kbd>B</kbd> to bark, <kbd>.</kbd> for normal time, <kbd>Shift</kbd>+<kbd>.</kbd> for fast.
      </Section>
      <Section q="Does it work offline?">
        Yes. It’s a PWA. Install it from your browser menu. Progress syncs when online.
      </Section>
      <Section q="Where is my save stored?">
        Your per-user doc lives in Firestore at <code>/dogs/{`{uid}`}</code>.
      </Section>
      <p className="text-sm text-emerald-900/70">Still stuck? Ping <Link className="underline" to="/settings">Settings</Link> → Export save and share logs.</p>
    </main>
  );
}
function Section({ q, children }) {
  return (
    <details className="rounded-xl border bg-white p-3">
      <summary className="font-medium cursor-pointer">{q}</summary>
      <div className="mt-2 text-emerald-900/80">{children}</div>
    </details>
  );
}
