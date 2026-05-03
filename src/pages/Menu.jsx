<<<<<<< HEAD
=======
// src/pages/Menu.jsx
>>>>>>> 0a405bd4 (Fix Doggerz index boot markup)
import { Link } from "react-router-dom";

import PageShell from "@/components/layout/PageShell.jsx";
import { MENU_CATEGORIES } from "@/app/routes.js";

export default function MenuPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="max-w-xl">
          <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/80">
            Utility Drawer
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-100">
            Keep this tight.
          </h1>
        </div>

        <div className="mt-8 space-y-8">
          {MENU_CATEGORIES.map((category) => (
            <section key={category.key}>
              <h2 className="mb-3 text-sm font-bold uppercase tracking-[0.24em] text-emerald-300/75">
                {category.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group rounded-3xl border border-white/10 bg-black/25 p-5 transition hover:border-emerald-400/35 hover:bg-emerald-500/5"
                  >
                    <div className="text-lg font-extrabold text-zinc-100 transition group-hover:text-emerald-100">
                      {item.label}
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">{item.detail}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-zinc-400">
          Core support and policy pages are grouped above under Support &amp;
          Info. Care systems like potty, memories, dreams, and the training
          roadmap now live here too, while app tuning still lives in{" "}
          <Link
            to="/settings"
            className="font-semibold text-emerald-200 hover:text-emerald-100"
          >
            Settings
          </Link>
          .
        </div>

        <div className="mt-8">
          <Link
            to="/settings"
            className="inline-block rounded-3xl border border-emerald-400/35 bg-emerald-500/10 px-6 py-3 font-semibold text-emerald-200 transition hover:bg-emerald-500/20 hover:text-emerald-100"
          >
            Settings
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
