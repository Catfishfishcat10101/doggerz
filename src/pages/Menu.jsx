// src/pages/Menu.jsx
import { Link } from "react-router-dom";

import PageShell from "@/components/layout/PageShell.jsx";
import { MENU_CATEGORIES } from "@/app/routes.js";

export default function MenuPage() {
  return (
    <PageShell useSurface={true}>
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-0">
        <header className="max-w-2xl px-1">
          <div className="env-label">Doggerz menu</div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-100 text-center sm:text-left">
            Care, account, and support
          </h1>
          <p className="mt-3 text-sm leading-6 text-zinc-400 text-center sm:text-left">
            Everything outside the yard stays organized here so the main game
            screen can stay focused on your dog.
          </p>
        </header>

        <div className="space-y-8">
          {MENU_CATEGORIES.map((category) => (
            <section key={category.key}>
              <h2 className="mb-3 text-center text-xs font-black uppercase tracking-[0.22em] text-emerald-300/75 sm:text-left">
                {category.title}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="doggerz-card group min-h-28 rounded-[26px] p-5 transition active:scale-[0.99] hover:border-emerald-400/35 hover:bg-emerald-500/5"
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

        <div className="pt-2">
          <Link
            to="/settings"
            className="doggerz-button doggerz-button-primary mx-auto w-full sm:mx-0 sm:w-fit"
          >
            Open settings
          </Link>
        </div>
      </div>
    </PageShell>
  );
}

