//src/pages/Menu.jsx
import { Link } from "react-router-dom";
import PageShell from "@/components/layout/PageShell.jsx";
import { MENU_CATEGORIES } from "@/app/routes.js";

export default function MenuPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl px-4 py-8">
        <div className="max-w-xl">
          <div className="text-[11px] uppercase tracking-[0.3em] text-emerald-300/80">
            Drawer
          </div>
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
                    <div className="text-lg font-extrabold text-zinc-100 transition group-hover:text-zinc-400">
                      {item.label}
                    </div>
                    <p className="mt-2 text-sm text-zinc-100">{item.detail}</p>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-zinc-600">
          Core Support and Policy are now under Settings
          <Link
            to="/settings"
            className="font-semibold text-emerald-600 hover:text-emerald-500"
          >
            Settings
          </Link>
          .
        </div>
      </div>
    </PageShell>
  );
}
