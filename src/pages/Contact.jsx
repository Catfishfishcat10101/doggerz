// src/pages/Contact.jsx
import React from "react";
import PageShell from "@/components/PageShell.jsx";

export default function Contact() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-2xl space-y-6">
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
            Contact
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Talk to us</h1>
          <p className="text-sm text-zinc-700 dark:text-white/70">
            Feedback, bug reports, and feature ideas are all welcome. Doggerz is a living project.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 space-y-4 text-sm text-zinc-700 dark:border-white/10 dark:bg-black/20 dark:text-white/75">
          <p>
            The fastest way to reach the developer is by email. Include what you were doing,
            what happened, and what you expected.
          </p>

          <a
            href="mailto:catfishfishcat10101@gmail.com?subject=Doggerz%20Feedback"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-black hover:bg-emerald-400 transition"
          >
            Email the developer
          </a>

          <p className="text-xs text-zinc-500 dark:text-white/50">
            Please avoid sending sensitive personal information. Screenshots and short videos are extremely helpful.
          </p>
        </section>
      </div>
    </PageShell>
  );
}
