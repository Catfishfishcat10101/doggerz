// src/pages/Menu.jsx
import { Link } from "react-router-dom";

import PageShell from "@/components/layout/PageShell.jsx";
import { MENU_CATEGORIES } from "@/app/routes.js";

export default function MenuPage() {
  return (
    <PageShell useSurface={true}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-7 px-0">
        <header className="doggerz-page-header">
          <div className="env-label">Support hub</div>
          <h1 className="doggerz-page-title">Everything supports the dog</h1>
          <p className="doggerz-page-copy">
            Core play stays in Yard, Care, Training, Shop, and Settings. These
            pages are here when you need support, account info, or records.
          </p>
        </header>

        <div className="space-y-7">
          {MENU_CATEGORIES.map((category) => (
            <section key={category.key}>
              <h2 className="mb-3 text-center text-xs font-black uppercase tracking-[0.22em] text-emerald-300/75">
                {category.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="doggerz-card group min-h-28 p-5 text-center transition active:scale-[0.99] hover:border-emerald-400/35 hover:bg-emerald-500/5"
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
      </div>
    </PageShell>
  );
}
