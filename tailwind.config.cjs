// tailwind.config.cjs
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
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto"],
      },

      // Doggerz brand palette
      colors: {
        doggerz: {
          bark: "#000000", // primary background
          paw: "#111827", // surfaces / cards
          sky: "#38bdf8", // accent cyan
          leaf: "#22c55e", // primary action green
          treat: "#fbbf24", // reward / highlight
          mange: "#9ca3af", // muted / negative / low states
          bone: "#f9fafb", // light text / subtle surfaces
        },
      },

      // Reusable card shadow
      boxShadow: {
        card: "0 8px 24px rgba(0, 0, 0, 0.25)",
      },

      // Typographic tweak for logo / brand text
      fontSize: {
        logo: ["2.25rem", { lineHeight: "2.5rem" }], // ~text-3xl but dedicated
      },

      // Sprite + float animations for the pup
      keyframes: {
        "sprite-walk": {
          "0%": { backgroundPosition: "0 0" },
          "100%": {
            backgroundPosition:
              "calc(var(--sprite-size) * -1 * (var(--sprite-frames) - 1)) 0",
          },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },

      animation: {
        "sprite-walk":
          "sprite-walk steps(var(--sprite-frames)) calc(1000ms / var(--sprite-fps)) infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
