// src/pages/Menu.jsx
import { Link } from "react-router-dom";

import PageShell from "@/components/layout/PageShell.jsx";
import { MENU_CATEGORIES } from "@/app/routes.js";

export default function MenuPage() {
  return (
    <PageShell useSurface={false} mainClassName="px-0 py-0">
      <div className="mx-auto min-h-[100dvh] w-full max-w-4xl px-4 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-6">
        <div className="max-w-xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-emerald-300/80">
            Doggerz menu
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-100">
            Care, account, and support
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Everything outside the yard stays organized here so the main game
            screen can stay focused on your dog.
          </p>
        </div>

        <div className="mt-7 space-y-8">
          {MENU_CATEGORIES.map((category) => (
            <section key={category.key}>
              <h2 className="mb-3 text-xs font-black uppercase tracking-[0.22em] text-emerald-300/75">
                {category.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group min-h-28 rounded-[26px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(0,0,0,0.2))] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.2)] transition active:scale-[0.99] hover:border-emerald-400/35 hover:bg-emerald-500/5"
                  >
                    <div className="text-lg font-black text-zinc-100 transition group-hover:text-emerald-100">
                      {item.label}
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      {item.detail}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/settings"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-emerald-400/35 bg-emerald-500/10 px-6 py-3 text-sm font-bold text-emerald-100 transition active:scale-[0.98] hover:bg-emerald-500/20"
          >
            Open settings
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
