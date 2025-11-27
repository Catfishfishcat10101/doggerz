// src/components/AppFooter.jsx
// Main footer for Doggerz app
import React from "react";
import { useNavigate } from "react-router-dom";

export default function AppFooter() {
  const navigate = useNavigate();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 text-xs text-zinc-500 py-4">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-zinc-500">&copy; {year} Doggerz.</p>

        <nav className="flex items-center gap-4" aria-label="Footer navigation">
          <button
            onClick={() => navigate("/press")}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Press
          </button>
          <button
            onClick={() => navigate("/contribute")}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Contribute
          </button>
          <button
            onClick={() => navigate("/support")}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Support
          </button>
          <button
            onClick={() => navigate("/faq")}
            className="text-zinc-400 hover:text-zinc-200"
          >
            FAQ
          </button>
          <button
            onClick={() => navigate("/about")}
            className="text-zinc-400 hover:text-zinc-200"
          >
            About
          </button>
          <button
            onClick={() => navigate("/contact")}
            className="text-zinc-400 hover:text-zinc-200"
          >
            Contact
          </button>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-zinc-200"
            aria-label="Facebook"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="inline-block"
            >
              <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H7.9v-2.9h2.54V9.83c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34v7.03C18.34 21.19 22 17.06 22 12.07z" />
            </svg>
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-zinc-400 hover:text-zinc-200"
            aria-label="GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 24 24"
              className="inline-block"
            >
              <path d="M12 .5C5.73.5.75 5.47.75 11.74c0 4.93 3.19 9.11 7.61 10.59.56.1.76-.24.76-.53 0-.26-.01-1.12-.02-2.03-3.09.67-3.74-1.49-3.74-1.49-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.12.08 1.71 1.15 1.71 1.15 1.01 1.72 2.65 1.22 3.29.93.1-.72.39-1.22.71-1.5-2.47-.28-5.06-1.24-5.06-5.52 0-1.22.43-2.21 1.14-2.99-.11-.28-.5-1.4.11-2.92 0 0 .93-.3 3.05 1.14a10.6 10.6 0 012.78-.38c.94.01 1.89.13 2.78.38 2.12-1.44 3.05-1.14 3.05-1.14.61 1.52.22 2.64.11 2.92.71.78 1.14 1.77 1.14 2.99 0 4.29-2.6 5.24-5.08 5.51.4.35.75 1.05.75 2.12 0 1.53-.01 2.76-.01 3.13 0 .29.2.64.77.53 4.42-1.48 7.61-5.66 7.61-10.59C23.25 5.47 18.27.5 12 .5z" />
            </svg>
          </a>
        </nav>
      </div>
    </footer>
  );
}
