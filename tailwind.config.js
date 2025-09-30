/** @type {import('tailwindcss').Config} */
export default {
  // Keep the net wide so nothing gets purged accidentally
  content: [
    "./index.html",
    "./public/**/*.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  // Let you force dark with a class (no weird OS flips mid-game)
  darkMode: "class",

  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto"],
      },

      // App tokens (high-contrast, low-glare)
      colors: {
        bgd: {
          900: "#0b1020",
          800: "#0f1730",
        },
      },

      boxShadow: {
        card: "0 8px 30px rgb(0 0 0 / 0.25)",
      },

      // Game UX: sprite + subtle float
      keyframes: {
        "sprite-walk": {
          from: { backgroundPosition: "0 0" },
          to:   { backgroundPosition: "calc(var(--sprite-size) * var(--sprite-frames) * -1) 0" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        "sprite-walk": "sprite-walk steps(var(--sprite-frames)) calc(1000ms / var(--sprite-fps)) infinite",
        float: "float 3s ease-in-out infinite",
      },
    },
  },

  // If you ever build class names dynamically, safelist them here
  safelist: [
    // e.g., yard color variants you toggle at runtime
    // "bg-emerald-700/20", "border-emerald-400/30", "text-emerald-200/80",
  ],

  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    // Optional: keep forms compact and contrasty by default
    function ({ addBase }) {
      addBase({
        ":root": { colorScheme: "dark" },
        "input, select, textarea": {
          backgroundColor: "rgba(255,255,255,0.06)",
          borderColor: "rgba(255,255,255,0.15)",
        },
      });
    },
  ],
};
