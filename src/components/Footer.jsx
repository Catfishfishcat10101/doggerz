import * as React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-zinc-800 bg-slate-950/60 px-4 py-6 text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-3 text-sm">
          <span className="text-emerald-400 font-black tracking-tight">DOGGERZ</span>
          <span className="text-zinc-500">© {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex gap-4">
            <Link to="/legal" className="text-sm hover:text-emerald-200">Legal</Link>
            <Link to="/privacy" className="text-sm hover:text-emerald-200">Privacy</Link>
            <Link to="/settings" className="text-sm hover:text-emerald-200">Settings</Link>
          </div>

          {/* Social buttons (same icons as header) */}
          <div className="flex items-center gap-2">
            <a href="#" aria-label="Twitter" className="text-zinc-300 hover:text-emerald-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M22 5.92c-.63.28-1.3.48-2 .57a3.46 3.46 0 0 0 1.52-1.92 6.9 6.9 0 0 1-2.2.84A3.44 3.44 0 0 0 12.1 8.3a9.76 9.76 0 0 1-7.08-3.59 3.44 3.44 0 0 0 1.06 4.59 3.4 3.4 0 0 1-1.56-.43v.04a3.44 3.44 0 0 0 2.75 3.37 3.5 3.5 0 0 1-.9.12 3.1 3.1 0 0 1-.65-.06 3.45 3.45 0 0 0 3.22 2.39A6.9 6.9 0 0 1 3 18.57 9.75 9.75 0 0 0 8.4 20c6.1 0 9.44-5.05 9.44-9.44v-.43A6.7 6.7 0 0 0 22 5.92z" />
              </svg>
            </a>

            <a href="#" aria-label="Discord" className="text-zinc-300 hover:text-emerald-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.5 4.5A19.9 19.9 0 0 0 16 3a13.2 13.2 0 0 0-.7 1.6A17.8 17.8 0 0 0 9.6 5 13.3 13.3 0 0 0 6 3.9 18.2 18.2 0 0 0 2 4.5C1.3 6.1 1.2 7.7 1.5 9.3a17.8 17.8 0 0 0 3.6 7.1 13.6 13.6 0 0 0 4.1 3.1c.3-.4.6-.8.9-1.2a8.9 8.9 0 0 1-1.3-.5c.1 0 .3.1.4.1 3.6 1.6 8.1 1.1 11.2-1.6 0 0-1.1 0-2.6-1.1a11.3 11.3 0 0 0 2.2-2.8 17.7 17.7 0 0 0 2.7-7.8c.2-1.6.1-3.2-.7-4.8z" />
              </svg>
            </a>

            <a href="#" aria-label="GitHub" className="text-zinc-300 hover:text-emerald-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 .5A12 12 0 0 0 0 12.6c0 5.3 3.4 9.8 8.2 11.4.6.1.8-.2.8-.5v-2c-3.3.7-4-1.6-4-1.6-.5-1.3-1.2-1.6-1.2-1.6-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 .1 1.8.7 2.2 1.2.1-.9.4-1.6.7-2-2.6-.3-5.4-1.3-5.4-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.3 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6.2 0c2.4-1.5 3.4-1.2 3.4-1.2.6 1.7.2 3 .1 3.3.7.9 1.2 2 1.2 3.2 0 4.6-2.8 5.6-5.4 5.9.4.3.8 1 .8 2v3c0 .3.2.6.8.5A12 12 0 0 0 24 12.6 12 12 0 0 0 12 .5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
