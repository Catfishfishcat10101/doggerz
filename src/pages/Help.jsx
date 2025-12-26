// src/pages/Help.jsx
import React from "react";
import { Link } from "react-router-dom";
import PageShell from "@/components/PageShell.jsx";

export default function HelpPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header className="space-y-2">
          <p className="text-[11px] uppercase tracking-[0.26em] text-emerald-700 dark:text-emerald-300/90">
            Help
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">Get unstuck</h1>
          <p className="text-sm text-zinc-700 dark:text-white/70">
            Quick fixes, common answers, and where to reach us when the pup gets spicy.
          </p>
        </header>

        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 space-y-3 dark:border-white/10 dark:bg-black/20">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white/90">Common fixes</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700 dark:text-white/75">
            <li>Refresh the page if something looks stuck.</li>
            <li>If you installed the app, fully close it and reopen to clear stale state.</li>
            <li>Sign-in issues? Check your connection and confirm Firebase is configured.</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white/80 p-5 space-y-2 dark:border-white/10 dark:bg-black/20">
          <h2 className="text-base font-semibold text-zinc-900 dark:text-white/90">Need support?</h2>
          <p className="text-sm text-zinc-700 dark:text-white/75">
            Reach out via{" "}
            <Link
              to="/contact"
              className="text-emerald-700 underline-offset-2 hover:text-emerald-600 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200"
            >
              Contact Us
            </Link>
            .
          </p>
        </section>

        <div className="pt-2 text-sm">
          <Link
            to="/"
            className="text-emerald-700 underline-offset-2 hover:text-emerald-600 hover:underline dark:text-emerald-300 dark:hover:text-emerald-200"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
