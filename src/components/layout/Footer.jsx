import { Link } from "react-router-dom";
import { SOCIAL_LINKS } from "@/config/links.js";

export default function Footer() {
  const year = new Date().getFullYear();
  const socials = [
    { key: "instagram", label: "Instagram" },
    { key: "facebook", label: "Facebook" },
  ];

  return (
    <footer className="mt-10 hidden border-t border-emerald-400/20 bg-slate-950/70 px-4 py-6 text-zinc-400 backdrop-blur-md md:block">
      <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="text-sm">
          <div className="flex items-center gap-3">
            <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text font-black tracking-tight text-transparent">
              DOGGERZ @ 2026
            </span>
            <span className="text-zinc-500">(c) {year}</span>
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            Not responsible for chewed shoes or missing socks.
          </div>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="grid w-full gap-4 text-sm text-zinc-300 sm:grid-cols-2">
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-500">
                Product
              </div>
              <nav className="mt-2 flex flex-col gap-1">
                <Link to="/faq" className="hover:text-emerald-200">
                  FAQs
                </Link>
                <Link to="/developers" className="hover:text-emerald-200">
                  Developers
                </Link>
                <Link to="/settings" className="hover:text-emerald-200">
                  Settings
                </Link>
                <Link to="/legal" className="hover:text-emerald-200">
                  Legal
                </Link>
                <Link to="/privacy" className="hover:text-emerald-200">
                  Privacy
                </Link>
              </nav>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <div className="flex flex-wrap items-center gap-2">
              {socials.map((item) => {
                const href = SOCIAL_LINKS[item.key];
                return href ? (
                  <a
                    key={item.key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-emerald-400/20 px-2.5 py-0.5 text-xs text-emerald-200/90 hover:border-emerald-400/50 hover:text-emerald-200"
                  >
                    {item.label}
                  </a>
                ) : (
                  <span
                    key={item.key}
                    className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-zinc-500/60"
                    aria-disabled="true"
                  >
                    {item.label}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
