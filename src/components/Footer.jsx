import { Link } from "react-router-dom";
import { SOCIAL_LINKS } from "@/config/links.js";

export default function Footer() {
  const year = new Date().getFullYear();
  const socials = [
    { key: "twitter", label: "X" },
    { key: "instagram", label: "Instagram" },
    { key: "tiktok", label: "TikTok" },
    { key: "youtube", label: "YouTube" },
    { key: "discord", label: "Discord" },
    { key: "facebook", label: "Facebook" },
  ];

  return (
    <footer className="mt-10 border-t border-white/10 bg-slate-950/60 px-4 py-6 text-zinc-400 backdrop-blur-md">
      <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div className="text-sm">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-black tracking-tight">
              DOGGERZ
            </span>
            <span className="text-zinc-500">c {year}</span>
          </div>
          <div className="mt-0.5 text-xs text-zinc-500">
            Not responsible for shoes, socks, or reputations destroyed.
          </div>
        </div>

        <div className="flex flex-col items-start gap-3 md:items-end">
          <nav className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-zinc-300 sm:grid-cols-3">
            <Link to="/legal" className="hover:text-emerald-200">
              Legal
            </Link>
            <Link to="/privacy" className="hover:text-emerald-200">
              Privacy
            </Link>
            <Link to="/faq" className="hover:text-emerald-200">
              FAQs
            </Link>
            <Link to="/developers" className="hover:text-emerald-200">
              Developers
            </Link>
            <Link to="/help" className="hover:text-emerald-200">
              Help
            </Link>
            <Link to="/settings" className="hover:text-emerald-200">
              Settings
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
            <span className="uppercase tracking-[0.2em] text-zinc-500/80">
              Like us on
            </span>
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
