import { Link } from "react-router-dom";

import PageShell from "@/components/layout/PageShell.jsx";
import { MENU_DESTINATIONS } from "@/app/routes.js";

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
          <p className="mt-3 text-sm text-zinc-400">
            Settings, help, and contact stay here. Everything else belongs in
            the main loop or inside Settings so this reads like an app drawer,
            not a website map.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {MENU_DESTINATIONS.map((item) => (
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

        <div className="mt-8 rounded-3xl border border-white/10 bg-black/20 px-5 py-4 text-sm text-zinc-400">
          Policies, privacy, and build info now live under{" "}
          <Link
            to="/settings"
            className="font-semibold text-emerald-200 hover:text-emerald-100"
          >
            Settings
          </Link>
          .
        </div>
      </div>
    </PageShell>
  );
}
