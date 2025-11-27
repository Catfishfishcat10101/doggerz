// tailwind.config.cjs - Doggerz brand palette and theme
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./public/**/*.{html,js,ts,jsx,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
    extend: {
      fontFamily: {
        // Main UI font
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto"],
        // Pixel / logo font (for big DOGGERZ text, etc.)
        display: ["'Press Start 2P'", "system-ui", "sans-serif"],
        // Debug / code font (for dev HUDs, logs)
        mono: ["'Roboto Mono'", "ui-monospace", "SFMono-Regular", "Menlo"],
      },

      // Doggerz brand palette
      colors: {
        doggerz: {
          bark: "#020617", // primary background (near-black, like bg-slate-950)
          paw: "#111827", // surfaces / cards
          bone: "#f9fafb", // light text / subtle surfaces
          leaf: "#22c55e", // primary action green
          sky: "#38bdf8", // accent cyan
          treat: "#fbbf24", // reward / highlight
          mange: "#9ca3af", // muted / disabled / low states
        },
        // CSS-variable driven tokens (mapped to runtime vars injected by AppShell)
        dg: {
          emerald: "var(--dg-emerald-500)",
          "emerald-300": "var(--dg-emerald-300)",
          muted: "var(--dg-muted)",
          bg: "var(--dg-bg)",
          surface: "var(--dg-surface)",
        },
      },

      boxShadow: {
        card: "0 8px 24px rgba(0, 0, 0, 0.25)",
      },

      fontSize: {
        // For big DOGGERZ wordmark in the header / splash
        logo: ["2.25rem", { lineHeight: "2.5rem" }],
      },

      borderRadius: {
        // Slightly softer cards/buttons by default if you want
        "2xl": "1rem",
      },

      backgroundImage: {
        // Subtle yard gradients you can reuse on splash / game screen
        "doggerz-yard":
          "radial-gradient(circle at top, rgba(34,197,94,0.18), transparent 55%), radial-gradient(circle at bottom, rgba(56,189,248,0.12), #020617)",
        "doggerz-night":
          "radial-gradient(circle at top, rgba(56,189,248,0.28), #020617)",
      },

      keyframes: {
        // Sprite sheet background-position animation (if you want pure-CSS anim)
        "sprite-walk": {
          "0%": { backgroundPosition: "0 0" },
          "100%": {
            backgroundPosition:
              "calc(var(--sprite-size) * -1 * (var(--sprite-frames) - 1)) 0",
          },
        },
        // Gentle float used on cards/icons
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
        // Tiny pulse for “level up”, new poll, etc.
        "ping-soft": {
          "0%": { transform: "scale(1)", opacity: 1 },
          "70%": { transform: "scale(1.05)", opacity: 0.6 },
          "100%": { transform: "scale(1)", opacity: 1 },
        },
      },

      animation: {
        "sprite-walk":
          "sprite-walk steps(var(--sprite-frames)) calc(1000ms / var(--sprite-fps)) infinite",
        float: "float 3s ease-in-out infinite",
        "ping-soft": "ping-soft 600ms ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
