// src/pages/Contact.jsx
// @ts-nocheck

import React from "react";

export default function Contact() {
  return (
    <main className="min-h-[calc(100vh-4rem)] bg-slate-950 text-zinc-100 flex justify-center px-4 py-10">
      <div className="w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Contact</h1>
          <p className="text-sm text-zinc-400">
            Feedback, bug reports, and feature ideas are all welcome. This is a
            living project.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-4 text-sm text-zinc-300">
          <p>
            The fastest way to reach the developer is by email. Describe what
            you were doing, what happened, and what you expected to happen.
          </p>

          <a
            href="mailto:catfishfishcat10101@gmail.com?subject=Doggerz%20Feedback"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400 transition"
          >
            Email the developer
          </a>

          <p className="text-xs text-zinc-500">
            Please avoid sending sensitive personal information. Screenshots and
            short videos of bugs are extremely helpful.
          </p>
        </section>
      </div>
    </main>
  );
}
