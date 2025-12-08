import * as React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import SocialLinks from "@/components/SocialLinks.jsx";
import {
  HEADER_WRAPPER,
  CONTAINER,
  NAV_CLASSES,
  SOCIAL_WRAPPER,
  FOOTER_WRAPPER,
} from "@/config/headerFooterStyles.js";

export default function Footer() {
  return (
    <footer className={FOOTER_WRAPPER} role="contentinfo">
      <div className={`${CONTAINER} flex-col gap-4 md:flex-row`}>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-emerald-400 font-black tracking-tight">
            Doggerz
          </span>
          <span className="text-zinc-500">© {new Date().getFullYear()}</span>
        </div>

        <div className="flex items-center gap-6">
          <nav className="hidden md:flex gap-4" aria-label="Footer navigation">
            <Link to="/legal" className="text-sm hover:text-emerald-200">
              Legal
            </Link>
            <Link to="/privacy" className="text-sm hover:text-emerald-200">
              Privacy
            </Link>
            <Link to="/settings" className="text-sm hover:text-emerald-200">
              Settings
            </Link>
          </nav>

          {/* Social buttons (same icons as header) */}
          <SocialLinks className={SOCIAL_WRAPPER} />
        </div>
      </div>
    </footer>
  );
}

/* Footer has no props */
