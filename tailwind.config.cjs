/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // matches <html class="dark">
  // Ensure classes used via `@apply` are preserved by the JIT/purge step
  safelist: [
    // explicit commonly used classes referenced in src/index.css
    "bg-zinc-950",
    "text-zinc-50",
    "border-zinc-800",
    "ring-offset-zinc-950",
    "ring-emerald-400",
    "bg-emerald-500",
    "text-zinc-950",
    "bg-emerald-400",
    "shadow-emerald-500/40",
    "bg-zinc-900/60",
    "bg-zinc-900/80",
    "border-zinc-700/80",
    "bg-emerald-500/10",
    "hover:bg-emerald-500",
    "hover:text-zinc-950",
    // keep a pattern to match additional color utilities
    {
      pattern:
        /^(bg|text|border|ring-offset|ring|shadow|hover:bg|hover:text)-(zinc|emerald)(-.+)?$/,
    },
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "ui-sans-serif", "sans-serif"],
        mono: ["Roboto Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        pixel: ['"Press Start 2P"', "system-ui", "sans-serif"],
      },
      colors: {
        doggerz: {
          bg: "#0b1020",
          neon: "#22c55e",
          neonSoft: "#4ade80",
        },
      },
      boxShadow: {
        "neon-green": "0 0 25px rgba(34,197,94,0.45)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
