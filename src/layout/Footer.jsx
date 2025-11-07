import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/20 backdrop-blur">
      <div className="container py-6">
        {/* Top row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold tracking-wide">🐾 Doggerz</span>
            <span className="hidden sm:inline text-white/60">
              Virtual dog simulator
            </span>
          </div>

          <nav aria-label="Footer" className="text-sm">
            <ul className="flex flex-wrap items-center gap-4 text-white/80">
              <li>
                <Link to="/legal/privacy" className="hover:text-white focus-ring">
                  Legal
                </Link>
              </li>
              <li>
                <Link to="/not-found" className="hover:text-white focus-ring">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/not-found" className="hover:text-white focus-ring">
                  Contact Us
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom row */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-white/60">
          <div>© {new Date().getFullYear()} Doggerz. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <a
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              rel="noreferrer"
              className="hover:text-white"
            >
              Firebase Privacy
            </a>
            <span className="opacity-30">•</span>
            <Link to="/legal/privacy" className="hover:text-white">
              Privacy & Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}